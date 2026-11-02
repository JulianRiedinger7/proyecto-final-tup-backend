import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TicketDependencyNotFoundError,
  TicketEventStartedError,
} from '../../../src/errors/TicketErrors';
import type { Espectadores } from '../../../src/models/Espectadores';
import type { Eventos } from '../../../src/models/Eventos';
import type { IEspectadorRepository } from '../../../src/repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../../../src/repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';
import { TicketService } from '../../../src/services/TicketService';

const evento: Eventos = {
  id: 1,
  titulo: 'Concierto',
  descripcion: 'Evento de prueba',
  fechaHora: '2030-10-10T20:00:00-03:00',
  lugar: 'Sala de prueba',
  aforoMaximo: 100,
  cupoReservasWeb: 50,
  precioPreventa: 5000,
  precioPuerta: 7000,
};

const espectador: Espectadores = {
  id: 2,
  nombre: 'Ana',
  apellido: 'Pérez',
  email: 'ana@example.com',
  dni: '12345678',
  telefono: '123456789',
  createdAt: new Date('2030-01-01T00:00:00.000Z'),
  isActive: true,
};

describe('Servicio de tickets: creación', () => {
  let servicio: TicketService;
  let repositorioTickets: ITicketRepository;
  let repositorioEventos: IEventoRepository;
  let repositorioEspectadores: IEspectadorRepository;

  beforeEach(() => {
    repositorioTickets = {
      findAll: vi.fn(),
      findById: vi.fn(),
      countNonCancelledByEvento: vi.fn().mockResolvedValue(0),
      create: vi.fn(async (datosTicket) => ({
        ...datosTicket,
        id: 3,
        codigoQr: 'ticket-qr',
        createdAt: '2030-10-09T15:00:00.000Z',
        fechaValidacionPuerta: null,
      })),
      update: vi.fn(),
      delete: vi.fn(),
    };
    repositorioEventos = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(evento),
      create: vi.fn(),
      replace: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    repositorioEspectadores = {
      findAll: vi.fn(),
      findByID: vi.fn().mockResolvedValue(espectador),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    servicio = new TicketService(repositorioTickets, repositorioEventos, repositorioEspectadores);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('crea un ticket con precio de preventa para un evento futuro y estado "RESERVADO"', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-09T12:00:00-03:00'));

    await servicio.createTicket({
      eventoId: evento.id,
      espectadorId: espectador.id,
    });

    expect(repositorioTickets.create).toHaveBeenCalledWith({
      eventoId: evento.id,
      espectadorId: espectador.id,
      precioUnitario: evento.precioPreventa,
      estado: 'RESERVADO',
    });
  });

  it('crea un ticket con precio de puerta el día del evento y estado "RESERVADO"', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-10T12:00:00-03:00'));

    await servicio.createTicket({
      eventoId: evento.id,
      espectadorId: espectador.id,
    });

    expect(repositorioTickets.create).toHaveBeenCalledWith({
      eventoId: evento.id,
      espectadorId: espectador.id,
      precioUnitario: evento.precioPuerta,
      estado: 'RESERVADO',
    });
  });

  it('rechaza la creación de un ticket cuando el evento ya comenzó', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-10T20:01:00-03:00'));

    await expect(
      servicio.createTicket({
        eventoId: evento.id,
        espectadorId: espectador.id,
      }),
    ).rejects.toBeInstanceOf(TicketEventStartedError);

    expect(repositorioTickets.create).not.toHaveBeenCalled();
  });

  it('rechaza la creación de un ticket cuando el evento no existe', async () => {
    vi.mocked(repositorioEventos.findById).mockResolvedValueOnce(undefined);

    await expect(
      servicio.createTicket({
        eventoId: evento.id,
        espectadorId: espectador.id,
      }),
    ).rejects.toBeInstanceOf(TicketDependencyNotFoundError);

    expect(repositorioTickets.create).not.toHaveBeenCalled();
  });

  it('rechaza la creación de un ticket cuando el espectador no existe', async () => {
    vi.mocked(repositorioEspectadores.findByID).mockResolvedValueOnce(undefined);

    await expect(
      servicio.createTicket({
        eventoId: evento.id,
        espectadorId: espectador.id,
      }),
    ).rejects.toBeInstanceOf(TicketDependencyNotFoundError);

    expect(repositorioTickets.create).not.toHaveBeenCalled();
  });

  it('rechaza la creación de un ticket cuando el espectador está inactivo', async () => {
    vi.mocked(repositorioEspectadores.findByID).mockResolvedValueOnce({
      ...espectador,
      isActive: false,
    });

    await expect(
      servicio.createTicket({
        eventoId: evento.id,
        espectadorId: espectador.id,
      }),
    ).rejects.toBeInstanceOf(TicketDependencyNotFoundError);

    expect(repositorioTickets.create).not.toHaveBeenCalled();
  });
});
