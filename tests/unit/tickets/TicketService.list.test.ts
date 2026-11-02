import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Ticket } from '../../../src/models/Ticket';
import type { IEspectadorRepository } from '../../../src/repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../../../src/repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../../../src/repositories/interfaces/ITicketRepository';
import type { TicketFilterParams } from '../../../src/schemas/ticket.schema';
import { TicketService } from '../../../src/services/TicketService';

const tickets: Ticket[] = [
  {
    id: 3,
    espectadorId: 2,
    eventoId: 1,
    codigoQr: 'ticket-qr',
    precioUnitario: 5000,
    estado: 'RESERVADO',
    createdAt: '2030-10-09T15:00:00.000Z',
    fechaValidacionPuerta: null,
  },
];

describe('Servicio de tickets: listado', () => {
  let servicio: TicketService;
  let repositorioTickets: ITicketRepository;

  beforeEach(() => {
    repositorioTickets = {
      findAll: vi.fn().mockResolvedValue({ items: tickets, total: tickets.length }),
      findById: vi.fn(),
      countNonCancelledByEvento: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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

  it('devuelve los tickets del repositorio aplicando los filtros recibidos', async () => {
    const filtros: TicketFilterParams = {
      estado: 'RESERVADO',
      eventoId: 1,
      page: 1,
      limit: 10,
    };

    const resultado = await servicio.listTickets(filtros);

    expect(repositorioTickets.findAll).toHaveBeenCalledWith(filtros);
    expect(resultado).toEqual({ items: tickets, total: tickets.length });
  });
});
