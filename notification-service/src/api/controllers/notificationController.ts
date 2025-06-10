import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as notificationService from '../../service/notificationService';

export const createNotification = async (req: Request, res: Response) => {
  try {
    const notification = await notificationService.createNotification(req.body);
    res.status(StatusCodes.CREATED).json(notification);
  } catch (error : any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getNotificationsByUser = async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getNotificationsByUser((req as any).user.id);
    res.status(StatusCodes.OK).json(notifications);
  } catch (error : any) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
  }
};