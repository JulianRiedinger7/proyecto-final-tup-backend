import initialTickets from '../../data/tickets.json';
import type { Ticket, TicketEstado, TicketSortBy, TicketSortOrder } from '../models/Ticket';
import type { NewTicket, PatchTicket, TicketFilterParams } from '../schemas/ticket.schema';

interface ITicketRepository {
  findAll(params?: TicketFilterParams): Promise<{ items: Ticket[]; total: number }>;
  findById(id: number): Promise<Ticket | undefined>;
  create(ticket: NewTicket): Promise<Ticket>;
  update(id: number, ticket: PatchTicket): Promise<Ticket | undefined>;
  delete(id: number): Promise<Ticket | undefined>;
}

export class TicketRepository implements ITicketRepository {
  private tickets: Ticket[] = [...initialTickets] as Ticket[];

  async findAll(params: TicketFilterParams = {}): Promise<{ items: Ticket[]; total: number }> {
    const {
      page = 1,
      limit,
      sortBy = 'id',
      sortOrder = 'asc',
      search,
      estado,
      espectadorId,
      eventoId,
    } = params;

    let result = this.filterTickets(this.tickets, search, estado, espectadorId, eventoId);
    result = this.sortTickets(result, sortBy, sortOrder);
    result = this.paginateTickets(result, page, limit);

    return Promise.resolve({
      items: result,
      total: result.length,
    });
  }

  async findById(id: number): Promise<Ticket | undefined> {
    return Promise.resolve(this.tickets.find((ticket) => ticket.id === id));
  }

  async create(ticket: NewTicket): Promise<Ticket> {
    const newTicket: Ticket = {
      id: this.tickets.length + 1,
      codigoQr: `CV-QR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      fechaValidacionPuerta: null,
      ...ticket,
    };
    this.tickets.push(newTicket);
    return Promise.resolve(newTicket);
  }

  async update(id: number, ticket: PatchTicket): Promise<Ticket | undefined> {
    const existingTicketIndex = this.tickets.findIndex((t) => t.id === id);
    if (existingTicketIndex === -1) {
      return Promise.resolve(undefined);
    }

    const updatedTicket = {
      ...this.tickets[existingTicketIndex],
      ...ticket,
    };

    this.tickets[existingTicketIndex] = updatedTicket;
    return Promise.resolve(updatedTicket);
  }

  async delete(id: number): Promise<Ticket | undefined> {
    const ticket = await this.findById(id);
    if (ticket) {
      this.tickets = this.tickets.filter((tickets) => tickets.id !== id);
    }
    return ticket;
  }

  private sortTickets(
    tickets: Ticket[],
    sortBy: TicketSortBy,
    sortOrder: TicketSortOrder,
  ): Ticket[] {
    return [...tickets].sort((ticketA, ticketB) => {
      const valueA = ticketA[sortBy];
      const valueB = ticketB[sortBy];

      if (valueA === undefined || valueA === null) return 1;
      if (valueB === undefined || valueB === null) return -1;

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private paginateTickets(
    tickets: Ticket[],
    page: number,
    limit: number = tickets.length,
  ): Ticket[] {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return tickets.slice(startIndex, endIndex);
  }

  private filterTickets(
    tickets: Ticket[],
    search?: string,
    estado?: TicketEstado,
    espectadorId?: number,
    eventoId?: number,
  ): Ticket[] {
    return tickets.filter((ticket) => {
      const matchesEstado = !estado || ticket.estado === estado;
      const matchesEspectadorId = !espectadorId || ticket.espectadorId === espectadorId;
      const matchesEventoId = !eventoId || ticket.eventoId === eventoId;
      const matchesSearch = !search || ticket.codigoQr.toLowerCase().includes(search.toLowerCase());
      return matchesEstado && matchesEspectadorId && matchesEventoId && matchesSearch;
    });
  }
}
