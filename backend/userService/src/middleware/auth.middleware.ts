
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ENV_VARS } from '../config/env.config';
import { User } from '../models/user.models';
import { UnauthorizedException } from '../utils/appError';
import { asyncHandler } from './asyncHandler.middleware';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const isAuth = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('No token provided');
  }

  const token = authHeader.split(' ')[1];

  const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET) as JwtPayload;
  const user = await User.findById(decoded.userId).select('-password');

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  req.user = user;
  next();
});
