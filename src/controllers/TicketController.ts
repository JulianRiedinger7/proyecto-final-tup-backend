import type { NextFunction, Request, Response } from 'express';
import type { TicketFilterParams, TicketIdParams } from '../schemas/ticket.schema';
import type { ITicketService } from '../services/interfaces/ITicketService';
import { errorResponse, successResponse } from '../utils/response';

export class TicketController {
  constructor(private readonly service: ITicketService) {}

  findAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const filters = req.query as unknown as TicketFilterParams;
      const tickets = await this.service.listTickets(filters);
      return successResponse(res, 'Tickets encontrados', 200, tickets);
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
      const { id } = req.params as unknown as TicketIdParams;

      const ticket = await this.service.getTicket(id);

      if (!ticket) {
        return errorResponse(res, 'Ticket no encontrado', 404);
      }
      return successResponse(res, 'Ticket encontrado', 200, ticket);
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
      const ticketData = req.body;
      const newTicket = await this.service.createTicket(ticketData);
      return successResponse(res, 'Ticket creado', 201, newTicket);
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
      const { id } = req.params as unknown as TicketIdParams;
      const deletedTicket = await this.service.deleteTicket(id);
      if (!deletedTicket) {
        return errorResponse(res, 'Ticket no encontrado', 404);
      }
      return successResponse(res, 'Ticket eliminado', 200, deletedTicket);
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
      const { id } = req.params as unknown as TicketIdParams;
      const ticketData = req.body;
      const updatedTicket = await this.service.updateTicket(id, ticketData);
      if (!updatedTicket) {
        return errorResponse(res, 'Ticket no encontrado', 404);
      }
      return successResponse(res, 'Ticket actualizado', 200, updatedTicket);
    } catch (error) {
      next(error);
    }
  };
}
