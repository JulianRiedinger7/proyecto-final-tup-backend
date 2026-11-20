import {
  EventoConTicketsActivosError,
  EventoCupoMenorATicketsError,
  EventoFechaHoraNoFuturaError,
  EventoHorarioDuplicadoError,
  EventoPrecioPuertaInferiorError,
  EventoRealizadoError,
} from '../errors/EventoErrors';
import type { Eventos } from '../models/Eventos';
import type { IEventoRepository } from '../repositories/interfaces/IEventoRepository';
import type { ITicketRepository } from '../repositories/interfaces/ITicketRepository';
import type { EventoFilterParams, NewEvento, PatchEvento } from '../schemas/evento.schema';
import { hasDateStarted } from '../utils/date';
import type { IEventoService } from './interfaces/IEventoService';

export class EventoService implements IEventoService {
  constructor(
    private readonly eventos: IEventoRepository,
    private readonly tickets: ITicketRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  findAll(params?: EventoFilterParams) {
    return this.eventos.findAll(params);
  }

  findById(id: number): Promise<Eventos | undefined> {
    return this.eventos.findById(id);
  }

  async create(evento: NewEvento): Promise<Eventos> {
    this.ensureFutureDate(evento.fechaHora);
    this.ensureValidPrices(evento);
    await this.ensureScheduleIsAvailable(evento.lugar, evento.fechaHora);
    return this.eventos.create(evento);
  }

  async replace(id: number, evento: NewEvento): Promise<Eventos | undefined> {
    const existing = await this.eventos.findById(id);
    if (!existing) return undefined;

    this.ensureEventCanBeModified(existing);
    this.ensureFutureDate(evento.fechaHora);
    this.ensureValidPrices(evento);
    await this.ensureScheduleIsAvailable(evento.lugar, evento.fechaHora, id);
    await this.ensureCapacityAllowsUpdate(id, evento.cupoReservasWeb);

    return this.eventos.replace(id, evento);
  }

  async update(id: number, cambios: PatchEvento): Promise<Eventos | undefined> {
    const existing = await this.eventos.findById(id);
    if (!existing) return undefined;

    this.ensureEventCanBeModified(existing);
    const updated = { ...existing, ...cambios };
    if (cambios.fechaHora !== undefined) this.ensureFutureDate(cambios.fechaHora);
    this.ensureValidPrices(updated);
    await this.ensureScheduleIsAvailable(updated.lugar, updated.fechaHora, id);
    await this.ensureCapacityAllowsUpdate(id, updated.cupoReservasWeb);

    return this.eventos.update(id, cambios);
  }

  async delete(id: number): Promise<Eventos | undefined> {
    const existing = await this.eventos.findById(id);
    if (!existing) return undefined;

    const activeTicketCount = await this.tickets.countNonCancelledByEvento(id);
    if (activeTicketCount > 0) throw new EventoConTicketsActivosError();

    return this.eventos.delete(id);
  }

  private ensureFutureDate(fechaHora: string): void {
    const eventTimestamp = Date.parse(fechaHora);
    if (Number.isNaN(eventTimestamp) || eventTimestamp <= this.now().getTime()) {
      throw new EventoFechaHoraNoFuturaError();
    }
  }

  private ensureValidPrices(evento: Pick<Eventos, 'precioPreventa' | 'precioPuerta'>): void {
    if (evento.precioPuerta < evento.precioPreventa) {
      throw new EventoPrecioPuertaInferiorError();
    }
  }

  private ensureEventCanBeModified(evento: Eventos): void {
    if (hasDateStarted(new Date(evento.fechaHora), this.now())) {
      throw new EventoRealizadoError();
    }
  }

  private async ensureScheduleIsAvailable(
    lugar: string,
    fechaHora: string,
    excludeId?: number,
  ): Promise<void> {
    const scheduleExists = await this.eventos.existsByLugarAndFechaHora(
      lugar,
      fechaHora,
      excludeId,
    );
    if (scheduleExists) throw new EventoHorarioDuplicadoError();
  }

  private async ensureCapacityAllowsUpdate(
    eventoId: number,
    cupoReservasWeb: number,
  ): Promise<void> {
    const activeTicketCount = await this.tickets.countNonCancelledByEvento(eventoId);
    if (cupoReservasWeb < activeTicketCount) {
      throw new EventoCupoMenorATicketsError();
    }
  }
}
