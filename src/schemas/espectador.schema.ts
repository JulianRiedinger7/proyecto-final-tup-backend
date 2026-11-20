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

export const newEspectadorSchema = z.object({
  nombre: z.coerce.string().trim().min(1).max(20),
  apellido: z.coerce.string().trim().min(1).max(20),
  email: z.coerce.string().trim().min(1).max(30),
  dni: z.coerce
    .string()
    .trim()
    .regex(/^\d{7,8}$/),
  telefono: z.coerce.string().trim().min(8).max(12),
});

export type NewEspectador = z.infer<typeof newEspectadorSchema>;

export const patchEspectadorSchema = newEspectadorSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Ingrese al menos un campo para modificar',
  });

export type PatchEspectador = z.infer<typeof patchEspectadorSchema>;

export const deleteEspectadorSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type deleteEspectador = z.infer<typeof deleteEspectadorSchema>;
