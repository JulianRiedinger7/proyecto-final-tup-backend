export const TICKET_ESTADOS = ['RESERVADO', 'CONFIRMADO', 'UTILIZADO', 'CANCELADO'] as const;

export const TICKET_SORT_BY = ['id', 'precioUnitario', 'estado', 'createdAt'] as const;

export const TICKET_SORT_ORDER = ['asc', 'desc'] as const;

export type TicketEstado = (typeof TICKET_ESTADOS)[number];

export interface Ticket {
  id: number;
  espectadorId: number;
  eventoId: number;
  codigoQr: string;
  precioUnitario: number;
  estado: TicketEstado;
  createdAt: string;
  fechaValidacionPuerta: string | null;
}

export type TicketSortBy = (typeof TICKET_SORT_BY)[number];
export type TicketSortOrder = (typeof TICKET_SORT_ORDER)[number];
