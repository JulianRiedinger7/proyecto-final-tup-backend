import type { Request, Response } from 'express';
import type { TicketRepository } from '../repositories/TicketRepository';
import type { TicketFilterParams, TicketIdParams } from '../schemas/ticket.schema';
import { errorResponse, successResponse } from '../utils/response';

export class TicketController {
  constructor(private readonly repo: TicketRepository) {}

  findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const filters = req.query as unknown as TicketFilterParams;
      const tickets = await this.repo.findAll(filters);
      return successResponse(res, 'Tickets encontrados', 200, tickets);
    } catch (error) {
      console.error(`Error al buscar los tickets: ${error}`);
      return errorResponse(res, 'Error al buscar los tickets', 500);
    }
  };

  findById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as unknown as TicketIdParams;

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

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const ticketData = req.body;
      const newTicket = await this.repo.create(ticketData);
      return successResponse(res, 'Ticket creado', 201, newTicket);
    } catch (error) {
      console.error(`Error al crear el ticket: ${error}`);
      return errorResponse(res, 'Error al crear el ticket', 500);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params as unknown as TicketIdParams;
      const deletedTicket = await this.repo.delete(id);
      if (!deletedTicket) {
        return errorResponse(res, 'Ticket no encontrado', 404);
      }
      return successResponse(res, 'Ticket eliminado', 200, deletedTicket);
    } catch (error) {
      console.error(`Error al eliminar el ticket: ${error}`);
      return errorResponse(res, 'Error al eliminar el ticket', 500);
    }
  };
}
