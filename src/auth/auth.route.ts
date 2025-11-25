import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { randomUUID } from 'crypto';

export const authRouter = Router();

authRouter.post('/login', (req: Request, res: Response) => {
    const tokenSecret = config.tokenSecret as string;
    const tokenExpiresIn = config.tokenExpiresIn as jwt.SignOptions['expiresIn'];
    const token = jwt.sign({ id: randomUUID() }, tokenSecret, { expiresIn: tokenExpiresIn });
    return res.json({ token });
});