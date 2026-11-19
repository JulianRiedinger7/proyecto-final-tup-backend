import type { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../utils/response';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const code = err.statusCode || err.status || 500;

  if (code >= 500) {
    console.error(_req.method, _req.path, err);
  }

  const msg = code === 500 ? 'Error interno del servidor' : err.message || 'Ocurrio un error';

  if (res.headersSent) {
    _next(err);
    return;
  }

  errorResponse(res, msg, code);
}
