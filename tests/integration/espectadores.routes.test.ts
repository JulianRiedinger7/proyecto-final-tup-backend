import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/app';
import type { Espectadores } from '../../src/models/Espectadores';

const espectadorDePrueba = {
  nombre: 'Espectador',
  apellido: 'De Prueba',
  email: 'integracion@example.com',
  dni: '99999999',
  telefono: '2914000000',
  isActive: true,
};

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

describe('Rutas de espectadores', () => {
  let app: App;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-01T12:00:00.000Z'));
    app = new App();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('POST /api/v1/espectador', () => {
    it('crea un espectador', async () => {
      const respuesta = await request(app.instance)
        .post('/api/v1/espectadores')
        .send(espectadorDePrueba);

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toMatchObject({
        msg: 'Espectador creado',
        code: 201,
        data: { ...espectadorDePrueba },
      });
    });

    it('responde 409 si el dni ya existe', async () => {
      await request(app.instance).post('/api/v1/espectadores').send(espectadorDePrueba).expect(201);

      const respuesta = await request(app.instance)
        .post('/api/v1/espectadores')
        .send({ ...espectadorDePrueba, email: 'otroEmail@example.com' });

      expect(respuesta.status).toBe(409);
    });

    it('responde 409 si el email ya existe', async () => {
      await request(app.instance).post('/api/v1/espectadores').send(espectadorDePrueba).expect(201);

      const respuesta = await request(app.instance)
        .post('/api/v1/espectadores')
        .send({ ...espectadorDePrueba, dni: '0303456' });

      expect(respuesta.status).toBe(409);
    });

    describe('PATCH /api/v1/espectadores', async () => {
      it('Edita un espectador exitosamente', async () => {
        const respuestaCreacion = await request(app.instance)
          .post('/api/v1/espectadores')
          .send(espectadorDePrueba);
        const espectadorCreado = respuestaCreacion.body.data as Espectadores;

        expect(respuestaCreacion.status).toBe(201);

        const respuestaActualizacion = await request(app.instance)
          .patch(`/api/v1/espectadores/${espectadorCreado.id}`)
          .send({ apellido: 'González' });

        expect(respuestaActualizacion.status).toBe(200);
        expect(respuestaActualizacion.body).toEqual({
          msg: 'Espectador actualizado',
          code: 200,
          data: {
            id: espectadorCreado.id,
            nombre: 'Espectador',
            apellido: 'González',
            email: 'integracion@example.com',
            dni: '99999999',
            telefono: '2914000000',
            isActive: true,
            createdAt: '2030-10-01T12:00:00.000Z',
          },
        });
      });

      it('No edita espectador con DNI ya existente, devuelve 409', async () => {
        const respuestaA = await request(app.instance)
          .post('/api/v1/espectadores')
          .send(espectadorDePrueba);
        expect(respuestaA.status).toBe(201);

        const respuestaB = await request(app.instance)
          .post('/api/v1/espectadores')
          .send({ ...espectadorDePrueba, dni: '88888888', email: 'otro@example.com' });
        expect(respuestaB.status).toBe(201);
        const espectadorB = respuestaB.body.data as Espectadores;

        const respuesta = await request(app.instance)
          .patch(`/api/v1/espectadores/${espectadorB.id}`)
          .send({ dni: espectadorDePrueba.dni });

        expect(respuesta.status).toBe(409);
      });

      it('No edita espectador con email ya existente, devuelve 409', async () => {
        const respuestaA = await request(app.instance)
          .post('/api/v1/espectadores')
          .send(espectadorDePrueba);
        expect(respuestaA.status).toBe(201);

        const respuestaB = await request(app.instance)
          .post('/api/v1/espectadores')
          .send({ ...espectadorDePrueba, dni: '8888888', email: 'otro@hotmail.com' });
        expect(respuestaB.status).toBe(201);
        const espectadorB = respuestaB.body.data as Espectadores;

        const respuesta = await request(app.instance)
          .patch(`/api/v1/espectadores/${espectadorB.id}`)
          .send({ email: espectadorDePrueba.email });

        expect(respuesta.status).toBe(409);
      });

      describe('PATCH /api/v1/espectadores/:id/baja', async () => {
        it('Dar de baja a espectador activo exitosamente', async () => {
          const respuestaCreacion = await request(app.instance)
            .post('/api/v1/espectadores')
            .send(espectadorDePrueba);
          const espectadorCreado = respuestaCreacion.body.data as Espectadores;

          expect(respuestaCreacion.status).toBe(201);

          const respuestaActualizacion = await request(app.instance)
            .patch(`/api/v1/espectadores/${espectadorCreado.id}/baja`)
            .send({ isActive: false });

          expect(respuestaActualizacion.status).toBe(200);
          expect(respuestaActualizacion.body).toEqual({
            msg: 'Espectador dado de baja',
            code: 200,
            data: {
              id: espectadorCreado.id,
              nombre: 'Espectador',
              apellido: 'De Prueba',
              email: 'integracion@example.com',
              dni: '99999999',
              telefono: '2914000000',
              isActive: false,
              createdAt: '2030-10-01T12:00:00.000Z',
            },
          });
        });

        it('No da de baja a aquellos espectadores con tickets reservados o activos', async () => {
          const respuestaEspectador = await request(app.instance)
            .post('/api/v1/espectadores')
            .send(espectadorDePrueba);
          expect(respuestaEspectador.status).toBe(201);
          const espectador = respuestaEspectador.body.data as Espectadores;

          const respuestaEvento = await request(app.instance)
            .post('/api/v1/eventos')
            .send(eventoDePrueba);
          expect(respuestaEvento.status).toBe(201);
          const evento = respuestaEvento.body.data;

          const respuestaTicket = await request(app.instance)
            .post('/api/v1/tickets')
            .send({ espectadorId: espectador.id, eventoId: evento.id });
          expect(respuestaTicket.status).toBe(201);

          const respuesta = await request(app.instance).patch(
            `/api/v1/espectadores/${espectador.id}/baja`,
          );

          expect(respuesta.status).toBe(409);

          const resConsulta = await request(app.instance).get(
            `/api/v1/espectadores/${espectador.id}`,
          );
          expect(resConsulta.body.data.isActive).toBe(true);
        });
      });

      describe('PATCH /api/v1/espectadores/:id/reactivar', async () => {
        it('Dar de alta a espectador inactivo exitosamente', async () => {
          const respuestaCreacion = await request(app.instance)
            .post('/api/v1/espectadores')
            .send(espectadorDePrueba);
          expect(respuestaCreacion.status).toBe(201);
          const espectadorCreado = respuestaCreacion.body.data as Espectadores;

          await request(app.instance)
            .patch(`/api/v1/espectadores/${espectadorCreado.id}/baja`)
            .expect(200);

          const respuesta = await request(app.instance).patch(
            `/api/v1/espectadores/${espectadorCreado.id}/reactivar`,
          );

          expect(respuesta.status).toBe(200);
          expect(respuesta.body).toEqual({
            msg: 'Espectador reactivado',
            code: 200,
            data: {
              id: espectadorCreado.id,
              nombre: 'Espectador',
              apellido: 'De Prueba',
              email: 'integracion@example.com',
              dni: '99999999',
              telefono: '2914000000',
              isActive: true,
              createdAt: '2030-10-01T12:00:00.000Z',
            },
          });
        });
      });
    });
  });
});
