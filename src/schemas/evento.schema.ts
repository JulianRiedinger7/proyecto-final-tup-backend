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

export const eventoIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type EventoIdParams = z.infer<typeof eventoIdParamsSchema>;

const eventoFieldsSchema = z.object({
  titulo: z.string().trim().min(1).max(100),
  descripcion: z.string().trim().min(1).max(500),
  fechaHora: z.iso.datetime(),
  lugar: z.string().trim().min(1).max(100),
  aforoMaximo: z.coerce.number().int().positive(),
  cupoReservasWeb: z.coerce.number().int().min(0),
  precioPreventa: z.coerce.number().min(0),
  precioPuerta: z.coerce.number().min(0),
});

function validateCapacity(
  evento: { aforoMaximo?: number; cupoReservasWeb?: number },
  context: z.RefinementCtx,
): void {
  if (
    evento.aforoMaximo !== undefined &&
    evento.cupoReservasWeb !== undefined &&
    evento.cupoReservasWeb > evento.aforoMaximo
  ) {
    context.addIssue({
      code: 'custom',
      path: ['cupoReservasWeb'],
      message: 'El cupo de reservas web no puede superar el aforo máximo',
    });
  }
}

export const newEventoSchema = eventoFieldsSchema.superRefine(validateCapacity);
export type NewEvento = z.infer<typeof newEventoSchema>;

export const patchEventoSchema = eventoFieldsSchema
  .partial()
  .refine((evento) => Object.keys(evento).length > 0, {
    message: 'Ingrese al menos un campo para modificar',
  })
  .superRefine(validateCapacity);
export type PatchEvento = z.infer<typeof patchEventoSchema>;
