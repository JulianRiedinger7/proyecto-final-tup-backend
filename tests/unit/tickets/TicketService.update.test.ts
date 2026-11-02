import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Ticket } from '../../../src/models/Ticket';
import type { IEspectadorRepository } from '../../../src/repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../../../src/repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';
import { TicketService } from '../../../src/services/TicketService';

const ticketReservado: Ticket = {
  id: 3,
  espectadorId: 2,
  eventoId: 1,
  codigoQr: 'ticket-qr',
  precioUnitario: 5000,
  estado: 'RESERVADO',
  createdAt: '2030-10-09T15:00:00.000Z',
  fechaValidacionPuerta: null,
};

const ticketConfirmado: Ticket = {
  ...ticketReservado,
  estado: 'CONFIRMADO',
};

describe('Servicio de tickets: actualización', () => {
  let servicio: TicketService;
  let repositorioTickets: ITicketRepository;

  beforeEach(() => {
    repositorioTickets = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(ticketReservado),
      countNonCancelledByEvento: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(ticketConfirmado),
      delete: vi.fn(),
    };
    const repositorioEventos: IEventoRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      replace: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    const repositorioEspectadores: IEspectadorRepository = {
      findAll: vi.fn(),
      findByID: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    servicio = new TicketService(repositorioTickets, repositorioEventos, repositorioEspectadores);
  });

  it('confirma un ticket reservado', async () => {
    const resultado = await servicio.updateTicket(ticketReservado.id, {
      estado: 'CONFIRMADO',
    });

    expect(repositorioTickets.update).toHaveBeenCalledWith(ticketReservado.id, {
      estado: 'CONFIRMADO',
    });
    expect(resultado).toEqual(ticketConfirmado);
  });
});
