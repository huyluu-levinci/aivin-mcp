import { Request, Response, NextFunction } from 'express';

export const checkClientKey = (req: Request, res: Response, next: NextFunction) => {
  const clientKey = req.headers['x-client-key'] as string;
  if (!clientKey) {
    return res.status(401).json({ error: 'Client key required' });
  }
  // Here you could validate the key against a database or config
  next();
};