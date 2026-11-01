import type { Espectadores } from '../../models/Espectadores';
import type {
  EspectadoresFilterParams,
  NewEspectador,
  PatchEspectador,
} from '../../schemas/espectador.schema';

export interface IEspectadorRepository {
  findAll(params?: EspectadoresFilterParams): Promise<{ items: Espectadores[]; total: number }>;
  findByID(id: number): Promise<Espectadores | undefined>;
  create(params: NewEspectador): Promise<Espectadores>;
  update(id: number, cambiosEspectador: PatchEspectador): Promise<Espectadores | undefined>;
  delete(id: number): Promise<Espectadores | undefined>;
}
