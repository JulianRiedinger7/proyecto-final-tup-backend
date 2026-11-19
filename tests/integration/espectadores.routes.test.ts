import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/app';

const espectadorDePrueba = {
  nombre: 'Espectador',
  apellido: 'De Prueba',
  email: 'integracion@example.com',
  dni: '99999999',
  telefono: '2914000000',
  isActive: true,
};

describe('Rutas de espectadores', () => {
  let app: App;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-01T12:00:00.000Z'));
    app = new App();
  });

  afterEach(() => {vi.useRealTimers();});

describe('POST /api/v1/espectador', () => {
    it('crea un espectador', async () => {
      const respuesta = await request(app.instance)
        .post('/api/v1/espectadores')
        .send(espectadorDePrueba);

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toMatchObject({
        msg: 'Espectador creado',
        code: 201,
        data: { ...espectadorDePrueba,},
      });
    });

    it('responde 409 si el dni ya existe', async () => {
  await request(app.instance)
    .post('/api/v1/espectadores')
    .send(espectadorDePrueba)
    .expect(201);

  const respuesta = await request(app.instance)
    .post('/api/v1/espectadores')
    .send({ ...espectadorDePrueba, email: 'otroEmail@example.com' }); 

  expect(respuesta.status).toBe(409);
    });

    it('responde 409 si el email ya existe', async () => {
        await request (app.instance)
            .post('/api/v1/espectadores').send(espectadorDePrueba).expect(201);

        const respuesta = await request(app.instance)
            .post('/api/v1/espectadores')
            .send({...espectadorDePrueba, dni: '0303456'});
        
        expect(respuesta.status).toBe(409)
    });
}); 
});