import type { Response } from 'express';

export function successResponse<T>(
  res: Response,
  msg: string = 'Operacion exitosa',
  code: number = 200,
  data: T,
): Response {
  return res.status(code).json({
    msg,
    code,
    data,
  });
}

export function errorResponse(
  res: Response,
  msg: string = 'Error interno del servidor',
  code: number = 500,
): Response {
  return res.status(code).json({
    msg,
    code,
  });
}
