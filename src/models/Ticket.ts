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
