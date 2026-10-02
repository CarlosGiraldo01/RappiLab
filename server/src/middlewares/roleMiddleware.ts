import { Request, Response, NextFunction } from 'express';
import Boom from '@hapi/boom';
import { Role } from '../shared/types';

export function roleMiddleware(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(Boom.forbidden('You do not have permission for did this actions'));
    }
    next();
  };
}