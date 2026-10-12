import type { Request, Response } from 'express';
import type { EspectadorRepository } from '../repositories/EspectadoresRepository';
import type { EspectadoresFilterParams } from '../schemas/espectador.schema';
import { errorResponse, successResponse } from '../utils/response';

export class EspectadorController {
  constructor(private readonly repo: EspectadorRepository) {}

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const filters = req.query as unknown as EspectadoresFilterParams;
      const espectadores = await this.repo.findAll(filters);
      return successResponse(res, 'Espectadores encontrados', 200, espectadores);
    } catch (error) {
      console.error(`Error al buscar los espectadores: ${error}`);
      return errorResponse(res, 'Error al buscar los espectadores', 500);
    }
  };
}
