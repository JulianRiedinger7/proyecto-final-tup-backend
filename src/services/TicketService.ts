import { TicketDependencyNotFoundError, TicketEventStartedError } from '../errors/TicketErrors';
import type { Ticket } from '../models/Ticket';
import type { IEspectadorRepository } from '../repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../repositories/interfaces/ITicketRepository';
import type { NewTicket, PatchTicket, TicketFilterParams } from '../schemas/ticket.schema';
import { getArgentinaDate, hasDateStarted } from '../utils/date';
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
    if (hasDateStarted(fechaHoraEvento, ahora)) {
      throw new TicketEventStartedError();
    }

    const fechaEvento = getArgentinaDate(fechaHoraEvento);
    const fechaActual = getArgentinaDate(ahora);
    const precioUnitario = fechaActual < fechaEvento ? evento.precioPreventa : evento.precioPuerta;

    return this.tickets.create({
      ...ticket,
      precioUnitario,
      estado: 'RESERVADO',
    });
  }
  updateTicket(id: number, ticket: PatchTicket): Promise<Ticket | undefined> {
    return this.tickets.update(id, ticket);
  }
  deleteTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.delete(id);
  }
}
