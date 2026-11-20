import { Router } from 'express';
import { EventoController } from '../controllers/EventoController';
import { validate } from '../middlewares/validate';
import { EventoRepository } from '../repositories/EventoRepository';
import {
  eventoIdParamsSchema,
  eventoQuerySchema,
  newEventoSchema,
  patchEventoSchema,
} from '../schemas/evento.schema';

export class EventoRoutes {
  private router: Router;

  constructor(private readonly eventoController = new EventoController(new EventoRepository())) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/', validate(eventoQuerySchema, 'query'), this.eventoController.findAll);
    this.router.get(
      '/:id',
      validate(eventoIdParamsSchema, 'params'),
      this.eventoController.findById,
    );
    this.router.post('/', validate(newEventoSchema, 'body'), this.eventoController.create);
    this.router.put(
      '/:id',
      validate(eventoIdParamsSchema, 'params'),
      validate(newEventoSchema, 'body'),
      this.eventoController.replace,
    );
    this.router.patch(
      '/:id',
      validate(eventoIdParamsSchema, 'params'),
      validate(patchEventoSchema, 'body'),
      this.eventoController.update,
    );
    this.router.delete(
      '/:id',
      validate(eventoIdParamsSchema, 'params'),
      this.eventoController.delete,
    );
  }

  getRoutes(): Router {
    return this.router;
  }
}
