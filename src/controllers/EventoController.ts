import type { Request, Response } from 'express';
import { EventoCapacityError, type EventoRepository } from '../repositories/EventoRepository';
import type {
  EventoFilterParams,
  EventoIdParams,
  NewEvento,
  PatchEvento,
} from '../schemas/evento.schema';
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

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as unknown as EventoIdParams;
      const evento = await this.repo.findById(id);
      if (!evento) return errorResponse(res, 'Evento no encontrado', 404);
      return successResponse(res, 'Evento encontrado', 200, evento);
    } catch (error) {
      console.error(`Error al buscar el evento: ${error}`);
      return errorResponse(res, 'Error al buscar el evento', 500);
    }
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const evento = await this.repo.create(req.body as NewEvento);
      return successResponse(res, 'Evento creado', 201, evento);
    } catch (error) {
      return this.handleMutationError(res, error, 'crear');
    }
  };

  replace = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as unknown as EventoIdParams;
      const evento = await this.repo.replace(id, req.body as NewEvento);
      if (!evento) return errorResponse(res, 'Evento no encontrado', 404);
      return successResponse(res, 'Evento reemplazado', 200, evento);
    } catch (error) {
      return this.handleMutationError(res, error, 'reemplazar');
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as unknown as EventoIdParams;
      const evento = await this.repo.update(id, req.body as PatchEvento);
      if (!evento) return errorResponse(res, 'Evento no encontrado', 404);
      return successResponse(res, 'Evento actualizado', 200, evento);
    } catch (error) {
      return this.handleMutationError(res, error, 'actualizar');
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as unknown as EventoIdParams;
      const evento = await this.repo.delete(id);
      if (!evento) return errorResponse(res, 'Evento no encontrado', 404);
      return successResponse(res, 'Evento eliminado', 200, evento);
    } catch (error) {
      console.error(`Error al eliminar el evento: ${error}`);
      return errorResponse(res, 'Error al eliminar el evento', 500);
    }
  };

  private handleMutationError(res: Response, error: unknown, action: string): Response {
    if (error instanceof EventoCapacityError) {
      return errorResponse(res, error.message, 400);
    }
    console.error(`Error al ${action} el evento: ${error}`);
    return errorResponse(res, `Error al ${action} el evento`, 500);
  }
}
