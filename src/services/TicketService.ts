import type { Ticket } from '../models/Ticket';
import type { IEspectadorRepository } from '../repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../repositories/interfaces/ITicketRepository';
import type { NewTicket, PatchTicket, TicketFilterParams } from '../schemas/ticket.schema';
import type { ITicketService } from './interfaces/ITicketService';

export class TicketService implements ITicketService {
  constructor(
    private readonly tickets: ITicketRepository,
    private readonly eventos: IEventoRepository,
    private readonly espectadores: IEspectadorRepository,
  ) {}

  listTickets(params?: TicketFilterParams): Promise<{ items: Ticket[]; total: number }> {
    return this.tickets.findAll(params);
  }
  getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.findById(id);
  }
  createTicket(ticket: NewTicket): Promise<Ticket> {
    return this.tickets.create(ticket);
  }
  updateTicket(id: number, ticket: PatchTicket): Promise<Ticket | undefined> {
    return this.tickets.update(id, ticket);
  }
  deleteTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.delete(id);
  }
}
