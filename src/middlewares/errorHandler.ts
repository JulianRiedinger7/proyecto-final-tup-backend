import type { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../utils/response';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(_req.method, _req.path, err);

  const code = err.statusCode || err.status || 500;
  const msg = code === 500 ? 'Error interno del servidor' : err.message || 'Ocurrio un error';

  res.status(code).json(errorResponse(msg, code));
}
