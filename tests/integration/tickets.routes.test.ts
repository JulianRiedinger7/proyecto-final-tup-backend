import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/app';
import type { Ticket } from '../../src/models/Ticket';

const eventoDePrueba = {
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
  email: 'integracion@example.com',
  dni: '99999999',
  telefono: '2914000000',
};

describe('Rutas de tickets', () => {
  let app: App;
  let eventoId: number;
  let espectadorId: number;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-01T12:00:00.000Z'));
    app = new App();

    const [respuestaEvento, respuestaEspectador] = await Promise.all([
      request(app.instance).post('/api/v1/eventos').send(eventoDePrueba),
      request(app.instance).post('/api/v1/espectadores').send(espectadorDePrueba),
    ]);

    expect(respuestaEvento.status).toBe(201);
    expect(respuestaEspectador.status).toBe(201);

    eventoId = respuestaEvento.body.data.id as number;
    espectadorId = respuestaEspectador.body.data.id as number;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('POST /api/v1/tickets', () => {
    it('crea un ticket para un espectador y evento válidos', async () => {
      const respuesta = await request(app.instance)
        .post('/api/v1/tickets')
        .send({ eventoId, espectadorId });

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toMatchObject({
        msg: 'Ticket creado',
        code: 201,
        data: {
          espectadorId,
          eventoId,
          precioUnitario: eventoDePrueba.precioPreventa,
          estado: 'RESERVADO',
          fechaValidacionPuerta: null,
        },
      });
    });
  });

  describe('GET /api/v1/tickets/:id', () => {
    it('obtiene por ID un ticket creado previamente', async () => {
      const respuestaCreacion = await request(app.instance)
        .post('/api/v1/tickets')
        .send({ eventoId, espectadorId });
      const ticketCreado = respuestaCreacion.body.data as Ticket;

      expect(respuestaCreacion.status).toBe(201);

      const respuestaConsulta = await request(app.instance).get(
        `/api/v1/tickets/${ticketCreado.id}`,
      );

      expect(respuestaConsulta.status).toBe(200);
      expect(respuestaConsulta.body).toEqual({
        msg: 'Ticket encontrado',
        code: 200,
        data: ticketCreado,
      });
    });
  });
});
