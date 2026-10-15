export const EVENTOS_SORT_BY = [
  'id',
  'titulo',
  'fechaHora',
  'lugar',
  'aforoMaximo',
  'cupoReservasWeb',
  'precioPreventa',
  'precioPuerta',
] as const;

export const EVENTOS_SORT_ORDER = ['asc', 'desc'] as const;

export interface Eventos {
  id: number;
  titulo: string;
  descripcion: string;
  fechaHora: string;
  lugar: string;
  aforoMaximo: number;
  cupoReservasWeb: number;
  precioPreventa: number;
  precioPuerta: number;
}

export type EventosSortBy = (typeof EVENTOS_SORT_BY)[number];
export type EventosSortOrder = (typeof EVENTOS_SORT_ORDER)[number];
