import { describe, expect, it } from 'vitest';
import { EventoCapacityError, EventoRepository } from '../../../src/repositories/EventoRepository';
import type { NewEvento } from '../../../src/schemas/evento.schema';

const datosEvento: NewEvento = {
  titulo: 'Concierto',
  descripcion: 'Evento de prueba',
  fechaHora: '2030-10-10T20:00:00.000Z',
  lugar: 'Sala de prueba',
  aforoMaximo: 100,
  cupoReservasWeb: 50,
  precioPreventa: 5000,
  precioPuerta: 7000,
};

describe('EventoRepository: capacidad en actualizaciones parciales', () => {
  it('valida el aforo contra el cupo web existente al modificar solo el aforo', async () => {
    const repositorio = new EventoRepository();
    const evento = await repositorio.create(datosEvento);

    await expect(
      repositorio.update(evento.id, { aforoMaximo: datosEvento.cupoReservasWeb - 1 }),
    ).rejects.toBeInstanceOf(EventoCapacityError);
  });
});
