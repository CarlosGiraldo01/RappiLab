import { Request, Response, NextFunction } from 'express';
import { isBoom } from '@hapi/boom';

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (isBoom(err)) {
    const { statusCode, payload } = err.output;
    return res.status(statusCode).json(payload);
  }
  console.error(err);
  res.status(500).json({ statusCode: 500, error: 'Internal Server Error', message: 'Something went wrong :(' });
}