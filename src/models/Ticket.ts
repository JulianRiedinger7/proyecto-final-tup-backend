export type TicketEstado = 'RESERVADO' | 'CONFIRMADO' | 'UTILIZADO' | 'CANCELADO';

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

export type TicketSortBy = 'id' | 'precioUnitario' | 'estado' | 'createdAt';
export type TicketSortOrder = 'asc' | 'desc';

export interface TicketFilterParams {
  page?: number;
  limit?: number;
  sortBy?: TicketSortBy;
  sortOrder?: TicketSortOrder;
  search?: string;
  estado?: TicketEstado;
  eventoId?: number;
  espectadorId?: number;
}
