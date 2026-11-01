import type { NextFunction, Request, Response } from 'express';
import type { IEspectadorRepository } from '../repositories/interfaces/IEspectadorRepository';
import type { EspectadoresFilterParams } from '../schemas/espectador.schema';
import { errorResponse, successResponse } from '../utils/response';

export class EspectadorController {
  constructor(private readonly repo: IEspectadorRepository) {}

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const filters = req.query as unknown as EspectadoresFilterParams;
      const espectadores = await this.repo.findAll(filters);
      return successResponse(res, 'Espectadores encontrados', 200, espectadores);
    } catch (error) {
      next(error);
    }
  };

  findByID = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const id = Number(req.params.id);
      const espectadores = await this.repo.findByID(id);
      if (!espectadores) {
        return errorResponse(res, 'Espectador no encontrado', 404);
      }
      return successResponse(res, 'Espectador encontrado', 200, espectadores);
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const EspectadorData = req.body;
      const NuevoEspectador = await this.repo.create(EspectadorData);
      return successResponse(res, 'Espectador creado', 201, NuevoEspectador);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const id = Number(req.params.id);
      const espectadorData = req.body;
      const espectador = await this.repo.update(id, espectadorData);
      if (!espectador) {
        return errorResponse(res, 'Espectador no encontrado', 404);
      }
      return successResponse(res, 'Espectador actualizado', 200, espectador);
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const id = Number(req.params.id);
      const espectador = await this.repo.delete(id);
      if (!espectador) {
        return errorResponse(res, 'Espectador no encontrado', 404);
      }
      return successResponse(res, 'Espectador eliminado', 200, espectador);
    } catch (error) {
      next(error);
    }
  };
}
