import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
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
    this.instance.use(errorHandler);
    this.instance.use('/api/v1/tickets', new TicketRoutes().getRoutes());
    this.instance.get('/api/v1/health', (_req, res) => successResponse(res, 'Status OK', 200, {}));
  }

  public listen(port: number, onReady?: () => void): import('node:http').Server {
    return this.instance.listen(port, onReady);
  }
}
