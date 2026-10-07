import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodType } from 'zod';

function errorMessage(error: ZodError): string {
  const issues: string[] = [];
  for (const issue of error.issues) {
    const field = issue.path.join('.') || 'body';
    issues.push(`${field}: ${issue.message}`);
  }
  return `Datos inválidos: ${issues.join('; ')}`;
}

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error: any = new Error(errorMessage(result.error));
      error.statusCode = 400;
      next(error);
      return;
    }

    req.body = result.data;
    next();
  };
}
