import { z } from 'zod';
import { EVENTOS_SORT_ORDER } from '../models/Eventos';

export const eventoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortOrder: z.enum(EVENTOS_SORT_ORDER).optional(),
  titulo: z.string().trim().min(1).max(100).optional(),
  lugar: z.string().trim().min(1).max(100).optional(),
});

export type EventoFilterParams = z.infer<typeof eventoQuerySchema>;
