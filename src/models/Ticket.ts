import type { Espectadores } from './Espectadores';
import type { Eventos } from './Eventos';

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

export type TicketListItem = Omit<Ticket, 'eventoId' | 'espectadorId'> & {
  evento: Pick<Eventos, 'id' | 'titulo' | 'fechaHora' | 'lugar'>;
  espectador: Pick<Espectadores, 'id' | 'nombre' | 'apellido'>;
};

export type TicketToCreate = Omit<
  Ticket,
  'id' | 'codigoQr' | 'createdAt' | 'fechaValidacionPuerta'
>;

export type TicketToUpdate = Pick<Ticket, 'estado'> &
  Partial<Pick<Ticket, 'fechaValidacionPuerta'>>;

export type TicketSortBy = (typeof TICKET_SORT_BY)[number];
export type TicketSortOrder = (typeof TICKET_SORT_ORDER)[number];
