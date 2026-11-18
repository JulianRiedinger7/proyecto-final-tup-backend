import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Ticket } from '../../../src/models/Ticket';
import type { IEspectadorRepository } from '../../../src/repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../../../src/repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';
import { TicketService } from '../../../src/services/TicketService';

const ticket: Ticket = {
  id: 3,
  espectadorId: 2,
  eventoId: 1,
  codigoQr: 'ticket-qr',
  precioUnitario: 5000,
  estado: 'RESERVADO',
  createdAt: '2030-10-09T15:00:00.000Z',
  fechaValidacionPuerta: null,
};

describe('Servicio de tickets: eliminación', () => {
  let servicio: TicketService;
  let repositorioTickets: ITicketRepository;

  beforeEach(() => {
    repositorioTickets = {
      findAll: vi.fn(),
      findById: vi.fn(),
      countNonCancelledByEvento: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(ticket),
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

  it('devuelve el ticket eliminado', async () => {
    const resultado = await servicio.deleteTicket(ticket.id);

    expect(repositorioTickets.delete).toHaveBeenCalledWith(ticket.id);
    expect(resultado).toEqual(ticket);
  });

  it('devuelve undefined cuando el ticket no existe', async () => {
    vi.mocked(repositorioTickets.delete).mockResolvedValueOnce(undefined);

    const resultado = await servicio.deleteTicket(999);

    expect(repositorioTickets.delete).toHaveBeenCalledWith(999);
    expect(resultado).toBeUndefined();
  });
});
