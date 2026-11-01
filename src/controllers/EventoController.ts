import type { NextFunction, Request, Response } from 'express';
import type { EventoRepository } from '../repositories/EventoRepository';
import type {
  EventoFilterParams,
  EventoIdParams,
  NewEvento,
  PatchEvento,
} from '../schemas/evento.schema';
import { errorResponse, successResponse } from '../utils/response';

export class EventoController {
  constructor(private readonly repo: EventoRepository) {}

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const filters = req.query as unknown as EventoFilterParams;
      const eventos = await this.repo.findAll(filters);
      return successResponse(res, 'Eventos encontrados', 200, eventos);
    } catch (error) {
      next(error);
    }
  };

  findById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const { id } = req.params as unknown as EventoIdParams;
      const evento = await this.repo.findById(id);
      if (!evento) return errorResponse(res, 'Evento no encontrado', 404);
      return successResponse(res, 'Evento encontrado', 200, evento);
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
      const evento = await this.repo.create(req.body as NewEvento);
      return successResponse(res, 'Evento creado', 201, evento);
    } catch (error) {
      next(error);
    }
  };

  replace = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const { id } = req.params as unknown as EventoIdParams;
      const evento = await this.repo.replace(id, req.body as NewEvento);
      if (!evento) return errorResponse(res, 'Evento no encontrado', 404);
      return successResponse(res, 'Evento reemplazado', 200, evento);
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
      const { id } = req.params as unknown as EventoIdParams;
      const evento = await this.repo.update(id, req.body as PatchEvento);
      if (!evento) return errorResponse(res, 'Evento no encontrado', 404);
      return successResponse(res, 'Evento actualizado', 200, evento);
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
      const { id } = req.params as unknown as EventoIdParams;
      const evento = await this.repo.delete(id);
      if (!evento) return errorResponse(res, 'Evento no encontrado', 404);
      return successResponse(res, 'Evento eliminado', 200, evento);
    } catch (error) {
      next(error);
    }
  };
}
