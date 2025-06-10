import { CreateNotificationDtoType } from '../api/dtos/notificationDto';
import * as notificationRepository from '../repository/notificationRepository';
import * as cache from '../cache/redis';

export const createNotification = async (notificationData: CreateNotificationDtoType) => {
  const notification = await notificationRepository.createNotification(notificationData);
  await cache.setNotification(notification.id, notification);
  return notification;
};

export const getNotificationsByUser = async (userId: string) => {
  const cachedNotifications = await cache.getNotificationsByUser(userId);
  if (cachedNotifications) {
    return cachedNotifications;
  }
  const notifications = await notificationRepository.findNotificationsByUser(userId);
  await cache.setNotificationsByUser(userId, notifications);
  return notifications;
};