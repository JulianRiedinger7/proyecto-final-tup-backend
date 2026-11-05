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

    it('devuelve 404 cuando el evento no existe', async () => {
      const respuesta = await request(app.instance)
        .post('/api/v1/tickets')
        .send({ eventoId: Number.MAX_SAFE_INTEGER, espectadorId });

      expect(respuesta.status).toBe(404);
      expect(respuesta.body).toEqual({
        msg: 'Evento no encontrado',
        code: 404,
      });
    });

    it('devuelve 404 cuando el espectador no existe', async () => {
      const respuesta = await request(app.instance)
        .post('/api/v1/tickets')
        .send({ eventoId, espectadorId: Number.MAX_SAFE_INTEGER });

      expect(respuesta.status).toBe(404);
      expect(respuesta.body).toEqual({
        msg: 'Espectador no encontrado o inactivo',
        code: 404,
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
      expect(respuestaConsulta.body).toMatchObject({
        msg: 'Ticket encontrado',
        code: 200,
        data: {
          id: ticketCreado.id,
          codigoQr: ticketCreado.codigoQr,
          precioUnitario: ticketCreado.precioUnitario,
          estado: ticketCreado.estado,
          createdAt: ticketCreado.createdAt,
          fechaValidacionPuerta: ticketCreado.fechaValidacionPuerta,
          evento: {
            id: eventoId,
            titulo: eventoDePrueba.titulo,
            fechaHora: eventoDePrueba.fechaHora,
            lugar: eventoDePrueba.lugar,
          },
          espectador: {
            id: espectadorId,
            nombre: espectadorDePrueba.nombre,
            apellido: espectadorDePrueba.apellido,
          },
        },
      });
      expect(respuestaConsulta.body.data).not.toHaveProperty('eventoId');
      expect(respuestaConsulta.body.data).not.toHaveProperty('espectadorId');
    });

    it('devuelve 404 cuando el ticket no existe', async () => {
      const respuesta = await request(app.instance).get('/api/v1/tickets/999999');

      expect(respuesta.status).toBe(404);
      expect(respuesta.body).toEqual({
        msg: 'Ticket no encontrado',
        code: 404,
      });
    });

    it('devuelve 400 cuando el ID del ticket no es válido', async () => {
      const respuesta = await request(app.instance).get('/api/v1/tickets/abc');

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toMatchObject({
        code: 400,
        msg: expect.stringContaining('Datos inválidos'),
      });
    });
  });

  describe('GET /api/v1/tickets', () => {
    it('devuelve los datos resumidos del evento y espectador en cada ticket', async () => {
      await request(app.instance).post('/api/v1/tickets').send({ eventoId, espectadorId });

      const respuesta = await request(app.instance).get('/api/v1/tickets').query({ eventoId });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toMatchObject({
        msg: 'Tickets encontrados',
        code: 200,
        data: {
          total: 1,
          items: [
            {
              evento: {
                id: eventoId,
                titulo: eventoDePrueba.titulo,
                fechaHora: eventoDePrueba.fechaHora,
                lugar: eventoDePrueba.lugar,
              },
              espectador: {
                id: espectadorId,
                nombre: espectadorDePrueba.nombre,
                apellido: espectadorDePrueba.apellido,
              },
            },
          ],
        },
      });
      expect(respuesta.body.data.items[0]).not.toHaveProperty('eventoId');
      expect(respuesta.body.data.items[0]).not.toHaveProperty('espectadorId');
    });
  });

  describe('PATCH /api/v1/tickets/:id', () => {
    it('confirma un ticket reservado', async () => {
      const respuestaCreacion = await request(app.instance)
        .post('/api/v1/tickets')
        .send({ eventoId, espectadorId });
      const ticketCreado = respuestaCreacion.body.data as Ticket;

      expect(respuestaCreacion.status).toBe(201);

      const respuestaActualizacion = await request(app.instance)
        .patch(`/api/v1/tickets/${ticketCreado.id}`)
        .send({ estado: 'CONFIRMADO' });

      expect(respuestaActualizacion.status).toBe(200);
      expect(respuestaActualizacion.body).toEqual({
        msg: 'Ticket actualizado',
        code: 200,
        data: {
          ...ticketCreado,
          estado: 'CONFIRMADO',
        },
      });
    });

    it('permite modificar solo la fecha de validación en puerta', async () => {
      const respuestaCreacion = await request(app.instance)
        .post('/api/v1/tickets')
        .send({ eventoId, espectadorId });
      const ticketCreado = respuestaCreacion.body.data as Ticket;
      const fechaValidacionPuerta = '2030-10-10T20:00:00.000Z';

      const respuestaActualizacion = await request(app.instance)
        .patch(`/api/v1/tickets/${ticketCreado.id}`)
        .send({ fechaValidacionPuerta });

      expect(respuestaActualizacion.status).toBe(200);
      expect(respuestaActualizacion.body.data).toMatchObject({
        ...ticketCreado,
        fechaValidacionPuerta,
      });
    });

    it('rechaza campos que no sean estado o fecha de validación', async () => {
      const respuesta = await request(app.instance)
        .patch('/api/v1/tickets/1')
        .send({ precioUnitario: 100 });

      expect(respuesta.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/tickets/:id', () => {
    it('elimina un ticket existente', async () => {
      const respuestaCreacion = await request(app.instance)
        .post('/api/v1/tickets')
        .send({ eventoId, espectadorId });
      const ticketCreado = respuestaCreacion.body.data as Ticket;

      expect(respuestaCreacion.status).toBe(201);

      const respuestaEliminacion = await request(app.instance).delete(
        `/api/v1/tickets/${ticketCreado.id}`,
      );

      expect(respuestaEliminacion.status).toBe(200);
      expect(respuestaEliminacion.body).toEqual({
        msg: 'Ticket eliminado',
        code: 200,
        data: ticketCreado,
      });

      const respuestaConsulta = await request(app.instance).get(
        `/api/v1/tickets/${ticketCreado.id}`,
      );

      expect(respuestaConsulta.status).toBe(404);
      expect(respuestaConsulta.body).toEqual({
        msg: 'Ticket no encontrado',
        code: 404,
      });
    });
  });
});
