import type { Ticket, TicketListItem } from '../../models/Ticket';
import type { NewTicket, PatchTicket, TicketFilterParams } from '../../schemas/ticket.schema';

export interface ITicketService {
  listTickets(params?: TicketFilterParams): Promise<{ items: TicketListItem[]; total: number }>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: NewTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: PatchTicket): Promise<Ticket | undefined>;
  deleteTicket(id: number): Promise<Ticket | undefined>;
}
