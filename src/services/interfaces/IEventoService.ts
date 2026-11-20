import type { Eventos } from '../../models/Eventos';
import type { IEventoRepository } from '../../repositories/interfaces/IEventoRepository';
import type { EventoFilterParams, NewEvento, PatchEvento } from '../../schemas/evento.schema';

export interface IEventoService {
  findAll(params?: EventoFilterParams): ReturnType<IEventoRepository['findAll']>;
  findById(id: number): Promise<Eventos | undefined>;
  create(evento: NewEvento): Promise<Eventos>;
  replace(id: number, evento: NewEvento): Promise<Eventos | undefined>;
  update(id: number, cambios: PatchEvento): Promise<Eventos | undefined>;
  delete(id: number): Promise<Eventos | undefined>;
}
