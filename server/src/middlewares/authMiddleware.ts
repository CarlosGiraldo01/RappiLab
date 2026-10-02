import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Boom from '@hapi/boom';
import { JWT_SECRET } from '../config';
import { AuthUser } from '../shared/types';

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(Boom.unauthorized('No token provided'));
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    next(Boom.unauthorized('Invalid or expired token'));
  }
}