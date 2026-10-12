import { z } from 'zod';
import { ESPECTADORES_SORT_BY, ESPECTADORES_SORT_ORDER } from '../models/Espectadores';

export const espectadoresQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(ESPECTADORES_SORT_BY).optional(),
  sortOrder: z.enum(ESPECTADORES_SORT_ORDER).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});

export type EspectadoresFilterParams = z.infer<typeof espectadoresQuerySchema>;
