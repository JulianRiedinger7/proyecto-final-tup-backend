import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/app';
import type { Eventos } from '../../src/models/Eventos';

const eventoDePrueba: Omit<Eventos, 'id'> = {
  titulo: 'Evento de integración',
  descripcion: 'Evento creado para una prueba de integración',
  fechaHora: '2030-10-10T20:00:00.000Z',
  lugar: 'Sala de prueba',
  aforoMaximo: 100,
  cupoReservasWeb: 50,
  precioPreventa: 4000,
  precioPuerta: 5000,
};

const espectadorDePrueba = {
  nombre: 'Espectador',
  apellido: 'De Prueba',
  email: 'evento-integracion@example.com',
  dni: '88888888',
  telefono: '2914000000',
};

describe('Reglas de negocio de eventos', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function crearEvento(overrides: Partial<Omit<Eventos, 'id'>> = {}): Promise<number> {
    const respuesta = await request(app.instance)
      .post('/api/v1/eventos')
      .send({ ...eventoDePrueba, ...overrides });

    expect(respuesta.status).toBe(201);
    return respuesta.body.data.id as number;
  }

  async function crearTicket(eventoId: number): Promise<number> {
    const respuestaEspectador = await request(app.instance)
      .post('/api/v1/espectadores')
      .send(espectadorDePrueba);
    expect(respuestaEspectador.status).toBe(201);

    const respuestaTicket = await request(app.instance)
      .post('/api/v1/tickets')
      .send({
        eventoId,
        espectadorId: respuestaEspectador.body.data.id as number,
      });
    expect(respuestaTicket.status).toBe(201);
    return respuestaTicket.body.data.id as number;
  }

  it('rechaza la creación de eventos con fecha pasada', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-01T12:00:00.000Z'));

    const respuesta = await request(app.instance)
      .post('/api/v1/eventos')
      .send({ ...eventoDePrueba, fechaHora: '2030-10-01T11:59:59.999Z' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.msg).toContain('debe ser futura');
  });

  it('rechaza la reprogramación a una fecha pasada', async () => {
    const eventoId = await crearEvento();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-01T12:00:00.000Z'));

    const respuesta = await request(app.instance)
      .patch(`/api/v1/eventos/${eventoId}`)
      .send({ fechaHora: '2030-10-01T11:59:59.999Z' });
    const respuestaReemplazo = await request(app.instance)
      .put(`/api/v1/eventos/${eventoId}`)
      .send({ ...eventoDePrueba, fechaHora: '2030-10-01T11:59:59.999Z' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.msg).toContain('debe ser futura');
    expect(respuestaReemplazo.status).toBe(400);
  });

  it('rechaza cupo web mayor al aforo al modificar parcialmente', async () => {
    const eventoId = await crearEvento();

    const respuesta = await request(app.instance)
      .patch(`/api/v1/eventos/${eventoId}`)
      .send({ aforoMaximo: 40 });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.msg).toContain('cupo de reservas web');
  });

  it('rechaza precios de puerta menores a preventa, incluso en PATCH parcial', async () => {
    const eventoId = await crearEvento();
    const respuestaCreacion = await request(app.instance)
      .post('/api/v1/eventos')
      .send({ ...eventoDePrueba, precioPuerta: 3000 });
    const respuestaActualizacion = await request(app.instance)
      .patch(`/api/v1/eventos/${eventoId}`)
      .send({ precioPreventa: 6000 });

    expect(respuestaCreacion.status).toBe(400);
    expect(respuestaActualizacion.status).toBe(400);
    expect(respuestaActualizacion.body.msg).toContain('precio de puerta');
  });

  it('no reduce el cupo por debajo de los tickets no cancelados', async () => {
    const eventoId = await crearEvento({ cupoReservasWeb: 2 });
    await crearTicket(eventoId);

    const respuesta = await request(app.instance)
      .patch(`/api/v1/eventos/${eventoId}`)
      .send({ cupoReservasWeb: 0 });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.msg).toContain('tickets no cancelados');
  });

  it('rechaza dos eventos en el mismo lugar y fecha', async () => {
    await crearEvento();

    const respuesta = await request(app.instance)
      .post('/api/v1/eventos')
      .send({ ...eventoDePrueba, titulo: 'Otro evento' });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.msg).toContain('mismo lugar y fecha');
  });

  it('rechaza reprogramar un evento a un lugar y fecha ocupados', async () => {
    await crearEvento();
    const segundoEventoId = await crearEvento({
      fechaHora: '2030-10-11T20:00:00.000Z',
      lugar: 'Otra sala',
    });

    const respuesta = await request(app.instance).patch(`/api/v1/eventos/${segundoEventoId}`).send({
      fechaHora: eventoDePrueba.fechaHora,
      lugar: eventoDePrueba.lugar,
    });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.msg).toContain('mismo lugar y fecha');
  });

  it('impide modificar un evento que ya comenzó', async () => {
    const eventoId = await crearEvento();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-10T20:00:00.000Z'));

    const respuesta = await request(app.instance)
      .patch(`/api/v1/eventos/${eventoId}`)
      .send({ titulo: 'Evento modificado' });

    expect(respuesta.status).toBe(409);
    expect(respuesta.body.msg).toContain('ya comenzó');
  });

  it('no elimina eventos con tickets no cancelados, pero permite tickets cancelados', async () => {
    const eventoId = await crearEvento();
    const ticketId = await crearTicket(eventoId);

    const respuestaRechazada = await request(app.instance).delete(`/api/v1/eventos/${eventoId}`);
    expect(respuestaRechazada.status).toBe(409);
    expect(respuestaRechazada.body.msg).toContain('tickets no cancelados');

    const respuestaCancelacion = await request(app.instance)
      .patch(`/api/v1/tickets/${ticketId}`)
      .send({ estado: 'CANCELADO' });
    expect(respuestaCancelacion.status).toBe(200);

    const respuestaEliminacion = await request(app.instance).delete(`/api/v1/eventos/${eventoId}`);
    expect(respuestaEliminacion.status).toBe(200);
  }, 10000);
});
