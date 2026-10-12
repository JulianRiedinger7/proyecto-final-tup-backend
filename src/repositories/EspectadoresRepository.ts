import listaEspectadores from '../../data/espectadores.json';
import type {
  Espectadores,
  EspectadoresSortBy,
  EspectadoresSortOrder,
} from '../models/Espectadores';
import type { EspectadoresFilterParams } from '../schemas/espectador.schema';

interface IEspectadorRepository {
  findAll(params?: EspectadoresFilterParams): Promise<{ items: Espectadores[]; total: number }>;
}

const DEFAULT_LIMIT = 10;

export class EspectadorRepository implements IEspectadorRepository {
  private espectadores: Espectadores[] = listaEspectadores.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    apellido: e.apellido,
    email: e.email,
    dni: e.dni,
    telefono: e.telefono,
    createdAt: e.created_at,
    isActive: e.is_active,
  }));

  async findAll(params: EspectadoresFilterParams = {}): Promise<{
    items: Espectadores[];
    total: number;
  }> {
    const { page = 1, limit = DEFAULT_LIMIT, sortBy = 'id', sortOrder = 'asc', search } = params;

    const filtered = this.filterEspectadores(this.espectadores, search);
    const sorted = this.sortEspectadores(filtered, sortBy, sortOrder);
    const items = this.paginateEspectadores(sorted, page, limit);

    return { items, total: filtered.length };
  }

  private filterEspectadores(list: Espectadores[], search?: string): Espectadores[] {
    if (!search) return list;
    const term = search.toLowerCase();
    return list.filter((e) => e.dni.includes(term) || e.email.toLowerCase().includes(term));
  }

  private sortEspectadores(
    list: Espectadores[],
    sortBy: EspectadoresSortBy,
    sortOrder: EspectadoresSortOrder,
  ): Espectadores[] {
    const dir = sortOrder === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const A = a[sortBy];
      const B = b[sortBy];
      const cmp =
        typeof A === 'number' && typeof B === 'number' ? A - B : String(A).localeCompare(String(B));
      return cmp * dir;
    });
  }

  private paginateEspectadores(list: Espectadores[], page: number, limit: number): Espectadores[] {
    const start = (page - 1) * limit;
    return list.slice(start, start + limit);
  }
}
