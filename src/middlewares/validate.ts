import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodType } from 'zod';

function errorMessage(error: ZodError, source: RequestPart): string {
  const issues: string[] = [];
  for (const issue of error.issues) {
    const field = issue.path.join('.') || source;
    issues.push(`${field}: ${issue.message}`);
  }
  return `Datos inválidos: ${issues.join('; ')}`;
}

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodType, source: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const error: any = new Error(errorMessage(result.error, source));
      error.statusCode = 400;
      next(error);
      return;
    }

    req[source] = result.data;
    next();
  };
}
