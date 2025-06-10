import request from 'supertest';
import app from '../../server';
import * as notificationService from '../../service/notificationService';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

jest.mock('../../service/notificationService');
jest.mock('jsonwebtoken');

describe('Notification Controller', () => {
  const mockToken = 'mockJwtToken';
  const mockUser = { id: 'user-uuid' };

  beforeEach(() => {
    jest.clearAllMocks();
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, mockUser);
    });
  });

  it('should create a notification successfully', async () => {
    const mockNotification = { id: 'notif-uuid', userId: mockUser.id, message: 'Test notification', type: 'in-app' };
    (notificationService.createNotification as jest.Mock).mockResolvedValue(mockNotification);

    const response = await request(app)
      .post('/api/v1/notifications')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ userId: mockUser.id, message: 'Test notification', type: 'in-app' });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toEqual(mockNotification);
    expect(notificationService.createNotification).toHaveBeenCalledWith({
      userId: mockUser.id,
      message: 'Test notification',
      type: 'in-app'
    });
  });

  it('should fail to create a notification with invalid data', async () => {
    const response = await request(app)
      .post('/api/v1/notifications')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ userId: 'invalid-uuid', message: '', type: 'invalid' });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should get notifications by user', async () => {
    const mockNotifications = [
      { id: 'notif-uuid', userId: mockUser.id, message: 'Test notification', type: 'in-app' }
    ];
    (notificationService.getNotificationsByUser as jest.Mock).mockResolvedValue(mockNotifications);

    const response = await request(app)
      .get('/api/v1/notifications/user')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual(mockNotifications);
    expect(notificationService.getNotificationsByUser).toHaveBeenCalledWith(mockUser.id);
  });
});