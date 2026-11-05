import {
  TicketCapacityExceededError,
  TicketDependencyNotFoundError,
  TicketEventStartedError,
  TicketInvalidTransitionError,
} from '../errors/TicketErrors';
import type { Ticket, TicketEstado, TicketListItem } from '../models/Ticket';
import type { IEspectadorRepository } from '../repositories/interfaces/IEspectadorRepository';
import type { IEventoRepository } from '../repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../repositories/interfaces/ITicketRepository';
import type { NewTicket, PatchTicket, TicketFilterParams } from '../schemas/ticket.schema';
import { getArgentinaDate, hasDateStarted } from '../utils/date';
import type { ITicketService } from './interfaces/ITicketService';

const validTicketTransitions: Record<TicketEstado, readonly TicketEstado[]> = {
  RESERVADO: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['UTILIZADO', 'CANCELADO'],
  UTILIZADO: [],
  CANCELADO: [],
};

export class TicketService implements ITicketService {
  constructor(
    private readonly tickets: ITicketRepository,
    private readonly eventos: IEventoRepository,
    private readonly espectadores: IEspectadorRepository,
  ) {}

  async listTickets(
    params?: TicketFilterParams,
  ): Promise<{ items: TicketListItem[]; total: number }> {
    const result = await this.tickets.findAll(params);
    const items: TicketListItem[] = [];

    for (const ticket of result.items) {
      items.push(await this.toTicketListItem(ticket));
    }

    return { items, total: result.total };
  }
  async getTicket(id: number): Promise<TicketListItem | undefined> {
    const ticket = await this.tickets.findById(id);
    return ticket ? this.toTicketListItem(ticket) : undefined;
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

    await this.ensureEventoHasCapacity(evento.id, evento.cupoReservasWeb);

    return this.tickets.create({
      ...ticket,
      precioUnitario,
      estado: 'RESERVADO',
    });
  }
  async updateTicket(id: number, ticket: PatchTicket): Promise<TicketListItem | undefined> {
    const existingTicket = await this.tickets.findById(id);
    if (!existingTicket) {
      return undefined;
    }

    if (
      ticket.estado !== undefined &&
      !validTicketTransitions[existingTicket.estado].includes(ticket.estado)
    ) {
      throw new TicketInvalidTransitionError(existingTicket.estado, ticket.estado);
    }

    const update =
      ticket.estado === 'UTILIZADO'
        ? { ...ticket, fechaValidacionPuerta: new Date().toISOString() }
        : ticket;

    const updatedTicket = await this.tickets.update(id, update);
    return updatedTicket ? this.toTicketListItem(updatedTicket) : undefined;
  }
  deleteTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.delete(id);
  }

  private async toTicketListItem(ticket: Ticket): Promise<TicketListItem> {
    const evento = await this.eventos.findById(ticket.eventoId);
    const espectador = await this.espectadores.findByID(ticket.espectadorId);

    if (!evento || !espectador) {
      throw new Error(`Dependencia no encontrada para el ticket ${ticket.id}`);
    }

    const { eventoId, espectadorId, ...ticketData } = ticket;
    return {
      ...ticketData,
      evento: {
        id: evento.id,
        titulo: evento.titulo,
        fechaHora: evento.fechaHora,
        lugar: evento.lugar,
      },
      espectador: {
        id: espectador.id,
        nombre: espectador.nombre,
        apellido: espectador.apellido,
      },
    };
  }

  private async ensureEventoHasCapacity(eventoId: number, cupoReservasWeb: number): Promise<void> {
    const ticketCount = await this.tickets.countNonCancelledByEvento(eventoId);
    if (ticketCount >= cupoReservasWeb) {
      throw new TicketCapacityExceededError();
    }
  }
}
