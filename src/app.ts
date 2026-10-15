import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { EspectadorRoutes } from './routes/EspectadorRoutes';
import { EventoRoutes } from './routes/EventoRoutes';
import { TicketRoutes } from './routes/TicketRoutes';
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
    this.instance.use('/api/v1/eventos', new EventoRoutes().getRoutes());
    this.instance.use('/api/v1/tickets', new TicketRoutes().getRoutes());
    this.instance.use('/api/v1/espectadores', new EspectadorRoutes().getRoutes());
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
