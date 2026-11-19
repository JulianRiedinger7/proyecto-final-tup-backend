import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';

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
        origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      }),
    );
    this.instance.use(express.json());
    this.instance.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  private setupRoutes(): void {
    this.instance.get('/', (_req, res) => {
      res.json({
        name: 'proyecto-final-backend',
        docs: '/api/health',
      });
    });

    this.instance.get('/api/health', (_req, res) => {
      res.json({
        status: 'ok',
        service: 'proyecto-final-backend',
        timestamp: new Date().toISOString(),
      });
    });
  }

  public listen(port: number, onReady?: () => void): void {
    this.instance.listen(port, onReady);
  }
}
