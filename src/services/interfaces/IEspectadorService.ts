import type { Espectadores } from '../../models/Espectadores';
import type {
  EspectadoresFilterParams,
  NewEspectador,
  PatchEspectador,
} from '../../schemas/espectador.schema';

export interface IEspectadorService {
  findAll(params?: EspectadoresFilterParams): Promise<{ items: Espectadores[]; total: number }>;
  findByID(id: number): Promise<Espectadores | undefined>;
  registrar(datos: NewEspectador): Promise<Espectadores>;
  editarUsuario(id: number, datos: PatchEspectador): Promise<Espectadores | undefined>;
  eliminarUsuario(id: number): Promise<Espectadores | undefined>;
  darDeBaja(id: number): Promise<Espectadores | undefined>;
  reactivar(id: number): Promise<Espectadores | undefined>;
}
