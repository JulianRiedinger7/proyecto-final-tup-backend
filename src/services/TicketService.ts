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
    throw new Error('Method not implemented.');
  }
  getTicket(id: number): Promise<Ticket | undefined> {
    throw new Error('Method not implemented.');
  }
  createTicket(ticket: NewTicket): Promise<Ticket> {
    throw new Error('Method not implemented.');
  }
  updateTicket(id: number, ticket: PatchTicket): Promise<Ticket | undefined> {
    throw new Error('Method not implemented.');
  }
  deleteTicket(id: number): Promise<Ticket | undefined> {
    throw new Error('Method not implemented.');
  }
}
