export const ESPECTADORES_SORT_BY = ['id', 'nombre', 'apellido', 'dni', 'email'] as const;

export const ESPECTADORES_SORT_ORDER = ['asc', 'desc'] as const;

export interface Espectadores {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
  createdAt: Date;
  isActive: boolean;
}

export type EspectadoresSortBy = (typeof ESPECTADORES_SORT_BY)[number];
export type EspectadoresSortOrder = (typeof ESPECTADORES_SORT_ORDER)[number];
