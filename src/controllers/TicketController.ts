import type { Request, Response } from 'express';
import type { TicketFilterParams } from '../models/Ticket';
import { TicketRepository } from '../repositories/TicketRepository';
import { errorResponse, successResponse } from '../utils/response';

export class TicketController {
  private repo: TicketRepository;

  constructor() {
    this.repo = new TicketRepository();
  }

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { page, limit, sortBy, sortOrder, search, estado, espectadorId, eventoId } =
        req.query as TicketFilterParams;
      const tickets = await this.repo.findAll({
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        estado,
        espectadorId,
        eventoId,
      });
      return successResponse(res, 'Tickets encontrados', 200, tickets);
    } catch (error) {
      console.error(`Error al buscar los tickets: ${error}`);
      return errorResponse(res, 'Error al buscar los tickets', 500);
    }
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return errorResponse(res, 'ID no es un numero', 400);
      }

      const ticket = await this.repo.findById(id);

      if (!ticket) {
        return errorResponse(res, 'Ticket no encontrado', 404);
      }
      return successResponse(res, 'Ticket encontrado', 200, ticket);
    } catch (error) {
      console.error(`Error al buscar el ticket: ${error}`);
      return errorResponse(res, 'Error al buscar el ticket', 500);
    }
  };
}
