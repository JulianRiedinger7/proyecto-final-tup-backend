import type { Ticket } from '../../models/Ticket';
import type { NewTicket, PatchTicket, TicketFilterParams } from '../../schemas/ticket.schema';

export interface ITicketRepository {
  findAll(params?: TicketFilterParams): Promise<{ items: Ticket[]; total: number }>;
  findById(id: number): Promise<Ticket | undefined>;
  create(ticket: NewTicket): Promise<Ticket>;
  update(id: number, ticket: PatchTicket): Promise<Ticket | undefined>;
  delete(id: number): Promise<Ticket | undefined>;
}
