import initialTickets from '../../data/tickets.json';
import type { Ticket, TicketEstado, TicketSortBy, TicketSortOrder } from '../models/Ticket';
import type { TicketFilterParams } from '../schemas/ticket.schema';

interface ITicketRepository {
  findAll(params?: TicketFilterParams): Promise<{ items: Ticket[]; total: number }>;
  findById(id: number): Promise<Ticket | undefined>;
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
