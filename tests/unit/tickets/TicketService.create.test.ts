import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Espectadores } from '../../../src/models/Espectadores';
import type { Eventos } from '../../../src/models/Eventos';
import type { Ticket } from '../../../src/models/Ticket';
import type { IEspectadorRepository } from '../../../src/repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../../../src/repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';
import { TicketService } from '../../../src/services/TicketService';

afterEach(() => {
  vi.useRealTimers();
});

describe('Servicio de tickets: creacion', () => {
  it('crea un ticket con precio de preventa para un evento futuro y estado "RESERVADO"', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-09T12:00:00-03:00'));

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
    const createdTicket: Ticket = {
      id: 3,
      espectadorId: espectador.id,
      eventoId: evento.id,
      codigoQr: 'ticket-qr',
      precioUnitario: evento.precioPreventa,
      estado: 'RESERVADO',
      createdAt: '2030-10-09T15:00:00.000Z',
      fechaValidacionPuerta: null,
    };

    const ticketRepository: ITicketRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      countNonCancelledByEvento: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue(createdTicket),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const eventoRepository: IEventoRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(evento),
      create: vi.fn(),
      replace: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const espectadorRepository: IEspectadorRepository = {
      findAll: vi.fn(),
      findByID: vi.fn().mockResolvedValue(espectador),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const service = new TicketService(ticketRepository, eventoRepository, espectadorRepository);

    const result = await service.createTicket({
      eventoId: evento.id,
      espectadorId: espectador.id,
    });

    expect(ticketRepository.create).toHaveBeenCalledWith({
      eventoId: evento.id,
      espectadorId: espectador.id,
      precioUnitario: evento.precioPreventa,
      estado: 'RESERVADO',
    });
    expect(result).toEqual(createdTicket);
  });

  it('crea un ticket con precio de puerta el día del evento y estado "RESERVADO"', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-10-10T12:00:00-03:00'));

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
    const ticketCreado: Ticket = {
      id: 3,
      espectadorId: espectador.id,
      eventoId: evento.id,
      codigoQr: 'ticket-qr',
      precioUnitario: evento.precioPuerta,
      estado: 'RESERVADO',
      createdAt: '2030-10-10T15:00:00.000Z',
      fechaValidacionPuerta: null,
    };

    const ticketRepository: ITicketRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      countNonCancelledByEvento: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue(ticketCreado),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const eventoRepository: IEventoRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(evento),
      create: vi.fn(),
      replace: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const espectadorRepository: IEspectadorRepository = {
      findAll: vi.fn(),
      findByID: vi.fn().mockResolvedValue(espectador),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const service = new TicketService(ticketRepository, eventoRepository, espectadorRepository);

    await service.createTicket({
      eventoId: evento.id,
      espectadorId: espectador.id,
    });

    expect(ticketRepository.create).toHaveBeenCalledWith({
      eventoId: evento.id,
      espectadorId: espectador.id,
      precioUnitario: evento.precioPuerta,
      estado: 'RESERVADO',
    });
  });
});
