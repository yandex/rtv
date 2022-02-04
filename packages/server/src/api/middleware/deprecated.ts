import { Request, Response, NextFunction } from 'express';

export const DEPRECATED = (req: Request, res: Response, next: NextFunction) => {
  res.append('x-deprecated', 'true');
  next();
};
