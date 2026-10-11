import { Router } from 'express';
import { TicketController } from '../controllers/TicketController';
import { validate } from '../middlewares/validate';
import { TicketRepository } from '../repositories/TicketRepository';
import { ticketIdParamsSchema, ticketQuerySchema } from '../schemas/ticket.schema';

export class TicketRoutes {
  private router: Router;

  constructor(private readonly ticketController = new TicketController(new TicketRepository())) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/', validate(ticketQuerySchema, 'query'), this.ticketController.findAll);
    this.router.get(
      '/:id',
      validate(ticketIdParamsSchema, 'params'),
      this.ticketController.findById,
    );
  }

  getRoutes(): Router {
    return this.router;
  }
}
