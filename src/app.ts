import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { EspectadorController } from './controllers/EspectadorController';
import { EventoController } from './controllers/EventoController';
import { TicketController } from './controllers/TicketController';
import { errorHandler } from './middlewares/errorHandler';
import { EspectadorRepository } from './repositories/EspectadoresRepository';
import { EventoRepository } from './repositories/EventoRepository';
import { TicketRepository } from './repositories/TicketRepository';
import { EspectadorRoutes } from './routes/EspectadorRoutes';
import { EventoRoutes } from './routes/EventoRoutes';
import { TicketRoutes } from './routes/TicketRoutes';
import { EspectadorService } from './services/EspectadorService';
import { EventoService } from './services/EventoService';
import { TicketService } from './services/TicketService';
import { successResponse } from './utils/response';

export class App {
  public readonly instance: express.Express;

  constructor() {
    this.instance = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    this.instance.use(helmet());
    this.instance.use(
      cors({
        origin: env.CORS_ORIGIN,
      }),
    );
    this.instance.use(express.json());
    this.instance.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  private setupRoutes(): void {
    const eventoRepo = new EventoRepository();
    const espectadorRepo = new EspectadorRepository();
    const ticketRepo = new TicketRepository();

    const eventoService = new EventoService(eventoRepo, ticketRepo);
    const ticketService = new TicketService(ticketRepo, eventoRepo, espectadorRepo);
    const espectadorService = new EspectadorService(espectadorRepo, ticketRepo);

    this.instance.use(
      '/api/v1/eventos',
      new EventoRoutes(new EventoController(eventoService)).getRoutes(),
    );
    this.instance.use(
      '/api/v1/tickets',
      new TicketRoutes(new TicketController(ticketService)).getRoutes(),
    );
    this.instance.use(
      '/api/v1/espectadores',
      new EspectadorRoutes(new EspectadorController(espectadorService)).getRoutes(),
    );
    this.instance.get('/api/v1/health', (_req, res) => successResponse(res, 'Status OK', 200, {}));

    this.instance.use((_req, _res, next) => {
      const error: any = new Error('Ruta no encontrada');
      error.statusCode = 404;
      next(error);
    });
    this.instance.use(errorHandler);
  }

  public listen(port: number, onReady?: () => void): import('node:http').Server {
    return this.instance.listen(port, onReady);
  }
}
