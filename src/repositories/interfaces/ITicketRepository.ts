import type { Ticket, TicketToCreate, TicketToUpdate } from '../../models/Ticket';
import type { TicketFilterParams } from '../../schemas/ticket.schema';

export interface ITicketRepository {
  findAll(params?: TicketFilterParams): Promise<{ items: Ticket[]; total: number }>;
  findById(id: number): Promise<Ticket | undefined>;
  countNonCancelledByEvento(eventoId: number): Promise<number>;
  create(ticket: TicketToCreate): Promise<Ticket>;
  update(id: number, ticket: TicketToUpdate): Promise<Ticket | undefined>;
  delete(id: number): Promise<Ticket | undefined>;
}
