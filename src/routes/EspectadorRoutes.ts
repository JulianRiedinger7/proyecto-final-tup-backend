import { Router } from 'express';
import { EspectadorController } from '../controllers/EspectadorController';
import { validate } from '../middlewares/validate';
import { EspectadorRepository } from '../repositories/EspectadoresRepository';
import {
  deleteEspectadorSchema,
  espectadoresQuerySchema,
  newEspectadorSchema,
  patchEspectadorSchema,
} from '../schemas/espectador.schema';

export class EspectadorRoutes {
  private router: Router;

  constructor(private readonly controller = new EspectadorController(new EspectadorRepository())) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/', validate(espectadoresQuerySchema, 'query'), this.controller.findAll);
    this.router.get('/:id', validate(deleteEspectadorSchema, 'params'), this.controller.findByID);
    this.router.post('/', validate(newEspectadorSchema, 'body'), this.controller.create);
    this.router.patch(
      '/:id',
      validate(deleteEspectadorSchema, 'params'),
      validate(patchEspectadorSchema, 'body'),
      this.controller.update,
    );
    this.router.delete('/:id', validate(deleteEspectadorSchema, 'params'), this.controller.delete);
  }

  getRoutes(): Router {
    return this.router;
  }
}
