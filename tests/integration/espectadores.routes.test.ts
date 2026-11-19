import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/app';
import { Espectadores } from '../../src/models/Espectadores';

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

    describe('PATCH /api/v1/espectadores', async ()=>{
        it('Edita un espectador exitosamente', async () => {
            const respuestaCreacion = await request(app.instance).post('/api/v1/espectadores').send(espectadorDePrueba);
            const espectadorCreado = respuestaCreacion.body.data as Espectadores;
            
            expect(respuestaCreacion.status).toBe(201);
            
            const respuestaActualizacion = await request(app.instance)
                    .patch(`/api/v1/espectadores/${espectadorCreado.id}`).send({ apellido: 'González' });
            
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

        it('No edita espectador con DNI ya existente, devuelve 409', async()=> {
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
                .send({...espectadorDePrueba, dni: '8888888', email: 'otro@hotmail.com'});
            expect(respuestaB.status).toBe(201);
            const espectadorB = respuestaB.body.data as Espectadores;

            const respuesta = await request(app.instance)
                .patch(`/api/v1/espectadores/${espectadorB.id}`)
                .send({email: espectadorDePrueba.email});
            
            expect(respuesta.status).toBe(409);
        });
    });
}); 
});