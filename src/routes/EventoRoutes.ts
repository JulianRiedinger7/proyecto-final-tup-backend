import { Router } from 'express';
import { EventoController } from '../controllers/EventoController';
import { validate } from '../middlewares/validate';
import { EventoRepository } from '../repositories/EventoRepository';
import { eventoQuerySchema } from '../schemas/evento.schema';

export class EventoRoutes {
  private router: Router;

  constructor(private readonly eventoController = new EventoController(new EventoRepository())) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/', validate(eventoQuerySchema, 'query'), this.eventoController.findAll);
  }

  getRoutes(): Router {
    return this.router;
  }
}
