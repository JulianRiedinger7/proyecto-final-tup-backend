import { Router } from 'express';
import { TicketController } from '../controllers/TicketController';

export class TicketRoutes {
  private router: Router;
  private ticketController: TicketController;

  constructor() {
    this.router = Router();
    this.ticketController = new TicketController();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/', this.ticketController.findAll);
    this.router.get('/:id', this.ticketController.findById);
  }

  getRoutes(): Router {
    return this.router;
  }
}
