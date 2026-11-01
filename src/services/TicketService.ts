import type { Ticket } from '../models/Ticket';
import type { IEspectadorRepository } from '../repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../repositories/interfaces/ITicketRepository';
import type { NewTicket, PatchTicket, TicketFilterParams } from '../schemas/ticket.schema';
import type { ITicketService } from './interfaces/ITicketService';

const argentinaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Argentina/Buenos_Aires',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function getArgentinaDate(date: Date): string {
  return argentinaDateFormatter.format(date);
}

export class TicketDependencyNotFoundError extends Error {
  readonly statusCode = 404;

  constructor(message: string) {
    super(message);
    this.name = 'TicketDependencyNotFoundError';
  }
}

export class TicketEventStartedError extends Error {
  readonly statusCode = 409;

  constructor() {
    super('No se pueden emitir tickets para un evento que ya comenzó');
    this.name = 'TicketEventStartedError';
  }
}

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
  async createTicket(ticket: NewTicket): Promise<Ticket> {
    const evento = await this.eventos.findById(ticket.eventoId);
    if (!evento) {
      throw new TicketDependencyNotFoundError('Evento no encontrado');
    }

    const espectador = await this.espectadores.findByID(ticket.espectadorId);
    if (!espectador?.isActive) {
      throw new TicketDependencyNotFoundError('Espectador no encontrado o inactivo');
    }

    const fechaHoraEvento = new Date(evento.fechaHora);
    const ahora = new Date();
    if (ahora >= fechaHoraEvento) {
      throw new TicketEventStartedError();
    }

    const fechaEvento = getArgentinaDate(fechaHoraEvento);
    const fechaActual = getArgentinaDate(ahora);
    const precioUnitario = fechaActual < fechaEvento ? evento.precioPreventa : evento.precioPuerta;

    return this.tickets.create({ ...ticket, precioUnitario });
  }
  updateTicket(id: number, ticket: PatchTicket): Promise<Ticket | undefined> {
    return this.tickets.update(id, ticket);
  }
  deleteTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.delete(id);
  }
}
