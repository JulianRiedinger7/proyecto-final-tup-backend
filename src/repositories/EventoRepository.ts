import initialEventos from '../../data/eventos.json';
import type { Eventos, EventosSortOrder } from '../models/Eventos';
import type { EventoFilterParams, NewEvento, PatchEvento } from '../schemas/evento.schema';
import type { IEventoRepository } from './interfaces/IEventoRepository';

const DEFAULT_LIMIT = 10;

export class EventoCapacityError extends Error {
  readonly statusCode = 400;

  constructor() {
    super('El cupo de reservas web no puede superar el aforo máximo');
    this.name = 'EventoCapacityError';
  }
}

export class EventoRepository implements IEventoRepository {
  private eventos: Eventos[] = [...initialEventos];

  async findAll(params: EventoFilterParams = {}): Promise<{ items: Eventos[]; total: number }> {
    const { page = 1, limit = DEFAULT_LIMIT, sortOrder = 'asc', titulo, lugar } = params;
    const filtered = this.filterEventos(this.eventos, titulo, lugar);
    const sorted = this.sortEventos(filtered, sortOrder);
    const start = (page - 1) * limit;

    return {
      items: sorted.slice(start, start + limit),
      total: filtered.length,
    };
  }

  async findById(id: number): Promise<Eventos | undefined> {
    return this.eventos.find((evento) => evento.id === id);
  }

  async create(evento: NewEvento): Promise<Eventos> {
    this.ensureValidCapacity(evento);
    const nextId = this.eventos.reduce((maxId, current) => Math.max(maxId, current.id), 0) + 1;
    const nuevoEvento: Eventos = { id: nextId, ...evento };
    this.eventos.push(nuevoEvento);
    return nuevoEvento;
  }

  async replace(id: number, evento: NewEvento): Promise<Eventos | undefined> {
    const index = this.eventos.findIndex((current) => current.id === id);
    if (index === -1) return undefined;

    this.ensureValidCapacity(evento);
    const eventoActualizado: Eventos = { id, ...evento };
    this.eventos[index] = eventoActualizado;
    return eventoActualizado;
  }

  async update(id: number, cambios: PatchEvento): Promise<Eventos | undefined> {
    const index = this.eventos.findIndex((current) => current.id === id);
    if (index === -1) return undefined;

    const eventoActualizado = { ...this.eventos[index], ...cambios };
    this.ensureValidCapacity(eventoActualizado);
    this.eventos[index] = eventoActualizado;
    return eventoActualizado;
  }

  async delete(id: number): Promise<Eventos | undefined> {
    const evento = await this.findById(id);
    if (evento) {
      this.eventos = this.eventos.filter((current) => current.id !== id);
    }
    return evento;
  }

  private filterEventos(eventos: Eventos[], titulo?: string, lugar?: string): Eventos[] {
    const tituloTerm = titulo?.toLocaleLowerCase();
    const lugarTerm = lugar?.toLocaleLowerCase();

    return eventos.filter((evento) => {
      const matchesTitulo = !tituloTerm || evento.titulo.toLocaleLowerCase().includes(tituloTerm);
      const matchesLugar = !lugarTerm || evento.lugar.toLocaleLowerCase().includes(lugarTerm);
      return matchesTitulo && matchesLugar;
    });
  }

  private sortEventos(eventos: Eventos[], sortOrder: EventosSortOrder): Eventos[] {
    const direction = sortOrder === 'asc' ? 1 : -1;
    return [...eventos].sort(
      (eventoA, eventoB) =>
        (Date.parse(eventoA.fechaHora) - Date.parse(eventoB.fechaHora)) * direction,
    );
  }

  private ensureValidCapacity(evento: Pick<Eventos, 'aforoMaximo' | 'cupoReservasWeb'>): void {
    if (evento.cupoReservasWeb > evento.aforoMaximo) {
      throw new EventoCapacityError();
    }
  }
}
