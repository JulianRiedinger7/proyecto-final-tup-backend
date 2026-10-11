import { z } from 'zod';
import { TICKET_ESTADOS, TICKET_SORT_BY, TICKET_SORT_ORDER } from '../models/Ticket';

export const ticketQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(TICKET_SORT_BY).optional(),
  sortOrder: z.enum(TICKET_SORT_ORDER).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  estado: z.enum(TICKET_ESTADOS).optional(),
  eventoId: z.coerce.number().int().positive().optional(),
  espectadorId: z.coerce.number().int().positive().optional(),
});

export type TicketFilterParams = z.infer<typeof ticketQuerySchema>;

export const ticketIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type TicketIdParams = z.infer<typeof ticketIdParamsSchema>;
