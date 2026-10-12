import { Router } from 'express';
import { EspectadorController } from '../controllers/EspectadorController';
import { validate } from '../middlewares/validate';
import { EspectadorRepository } from '../repositories/EspectadoresRepository';
import { espectadoresQuerySchema } from '../schemas/espectador.schema';

export class EspectadorRoutes {
  private router: Router;

  constructor(private readonly controller = new EspectadorController(new EspectadorRepository())) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/', validate(espectadoresQuerySchema, 'query'), this.controller.findAll);
  }

  getRoutes(): Router {
    return this.router;
  }
}
