import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as userService from '../../service/userService';

export const register = async (req: Request, res: Response) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(StatusCodes.CREATED).json(user);
  } catch (error : any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const token = await userService.loginUser(req.body);
    res.status(StatusCodes.OK).json({ token });
  } catch (error : any) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById((req as any).user.id);
    res.status(StatusCodes.OK).json(user);
  } catch (error : any) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
  }
};