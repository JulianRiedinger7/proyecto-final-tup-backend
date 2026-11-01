import type { Eventos } from '../../models/Eventos';
import type { EventoFilterParams, NewEvento, PatchEvento } from '../../schemas/evento.schema';

export interface IEventoRepository {
  findAll(params?: EventoFilterParams): Promise<{ items: Eventos[]; total: number }>;
  findById(id: number): Promise<Eventos | undefined>;
  create(evento: NewEvento): Promise<Eventos>;
  replace(id: number, evento: NewEvento): Promise<Eventos | undefined>;
  update(id: number, evento: PatchEvento): Promise<Eventos | undefined>;
  delete(id: number): Promise<Eventos | undefined>;
}
