import type { Request, Response } from 'express';
import type { EventoRepository } from '../repositories/EventoRepository';
import type { EventoFilterParams } from '../schemas/evento.schema';
import { errorResponse, successResponse } from '../utils/response';

export class EventoController {
  constructor(private readonly repo: EventoRepository) {}

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const filters = req.query as unknown as EventoFilterParams;
      const eventos = await this.repo.findAll(filters);
      return successResponse(res, 'Eventos encontrados', 200, eventos);
    } catch (error) {
      console.error(`Error al buscar los eventos: ${error}`);
      return errorResponse(res, 'Error al buscar los eventos', 500);
    }
  };
}
