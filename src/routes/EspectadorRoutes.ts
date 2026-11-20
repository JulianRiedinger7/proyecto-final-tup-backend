import { Router } from 'express';
import type { EspectadorController } from '../controllers/EspectadorController';
import { validate } from '../middlewares/validate';
import {
  deleteEspectadorSchema,
  espectadoresQuerySchema,
  newEspectadorSchema,
  patchEspectadorSchema,
} from '../schemas/espectador.schema';

export class EspectadorRoutes {
  private router: Router;

  constructor(private readonly controller: EspectadorController) {
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
    this.router.patch(
      '/:id/baja',
      validate(deleteEspectadorSchema, 'params'),
      this.controller.darDeBaja,
    );
    this.router.patch(
      '/:id/reactivar',
      validate(deleteEspectadorSchema, 'params'),
      this.controller.reactivar,
    );
    this.router.delete('/:id', validate(deleteEspectadorSchema, 'params'), this.controller.delete);
  }

  getRoutes(): Router {
    return this.router;
  }
}
