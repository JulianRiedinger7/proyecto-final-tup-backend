import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EventoConTicketsActivosError,
  EventoCupoMenorATicketsError,
  EventoFechaHoraNoFuturaError,
  EventoHorarioDuplicadoError,
  EventoPrecioPuertaInferiorError,
  EventoRealizadoError,
} from '../../../src/errors/EventoErrors';
import type { Eventos } from '../../../src/models/Eventos';
import type { IEventoRepository } from '../../../src/repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';
import type { NewEvento } from '../../../src/schemas/evento.schema';
import { EventoService } from '../../../src/services/EventoService';

const fechaActual = new Date('2030-10-01T12:00:00.000Z');

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

const evento: Eventos = {
  id: 1,
  ...datosEvento,
};

describe('EventoService', () => {
  let servicio: EventoService;
  let eventos: IEventoRepository;
  let tickets: ITicketRepository;

  beforeEach(() => {
    eventos = {
      findAll: vi.fn().mockResolvedValue({ items: [evento], total: 1 }),
      findById: vi.fn().mockResolvedValue(evento),
      existsByLugarAndFechaHora: vi.fn().mockResolvedValue(false),
      create: vi.fn().mockResolvedValue(evento),
      replace: vi.fn().mockResolvedValue(evento),
      update: vi.fn().mockResolvedValue(evento),
      delete: vi.fn().mockResolvedValue(evento),
    };
    tickets = {
      findAll: vi.fn(),
      findById: vi.fn(),
      countNonCancelledByEvento: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      existsByEspectadorAndEstados: vi.fn(),
    };
    servicio = new EventoService(eventos, tickets, () => fechaActual);
  });

  it('rechaza fechas pasadas al crear o reprogramar un evento', async () => {
    const fechaPasada = '2030-10-01T11:59:59.999Z';

    await expect(
      servicio.create({ ...datosEvento, fechaHora: fechaPasada }),
    ).rejects.toBeInstanceOf(EventoFechaHoraNoFuturaError);
    await expect(servicio.update(evento.id, { fechaHora: fechaPasada })).rejects.toBeInstanceOf(
      EventoFechaHoraNoFuturaError,
    );

    expect(eventos.create).not.toHaveBeenCalled();
    expect(eventos.update).not.toHaveBeenCalled();
  });

  it('valida la relación de precios usando los valores existentes en un PATCH parcial', async () => {
    await expect(
      servicio.update(evento.id, { precioPreventa: evento.precioPuerta + 1 }),
    ).rejects.toBeInstanceOf(EventoPrecioPuertaInferiorError);

    expect(eventos.update).not.toHaveBeenCalled();
  });

  it('no reduce el cupo web por debajo de los tickets no cancelados', async () => {
    vi.mocked(tickets.countNonCancelledByEvento).mockResolvedValueOnce(3);

    await expect(servicio.update(evento.id, { cupoReservasWeb: 2 })).rejects.toBeInstanceOf(
      EventoCupoMenorATicketsError,
    );

    expect(tickets.countNonCancelledByEvento).toHaveBeenCalledWith(evento.id);
    expect(eventos.update).not.toHaveBeenCalled();
  });

  it('rechaza una fecha y sala ya ocupadas', async () => {
    vi.mocked(eventos.existsByLugarAndFechaHora).mockResolvedValueOnce(true);

    await expect(servicio.create(datosEvento)).rejects.toBeInstanceOf(EventoHorarioDuplicadoError);

    expect(eventos.existsByLugarAndFechaHora).toHaveBeenCalledWith(
      datosEvento.lugar,
      datosEvento.fechaHora,
      undefined,
    );
    expect(eventos.create).not.toHaveBeenCalled();
  });

  it('impide modificar un evento que ya comenzó', async () => {
    vi.mocked(eventos.findById).mockResolvedValueOnce({
      ...evento,
      fechaHora: '2030-10-01T11:59:59.999Z',
    });

    await expect(servicio.update(evento.id, { titulo: 'Nuevo título' })).rejects.toBeInstanceOf(
      EventoRealizadoError,
    );

    expect(eventos.update).not.toHaveBeenCalled();
  });

  it('impide eliminar un evento con tickets no cancelados', async () => {
    vi.mocked(tickets.countNonCancelledByEvento).mockResolvedValueOnce(1);

    await expect(servicio.delete(evento.id)).rejects.toBeInstanceOf(EventoConTicketsActivosError);

    expect(tickets.countNonCancelledByEvento).toHaveBeenCalledWith(evento.id);
    expect(eventos.delete).not.toHaveBeenCalled();
  });
});
