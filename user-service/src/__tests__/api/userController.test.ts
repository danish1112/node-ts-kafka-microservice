import request from 'supertest';
import app from '../../server';
import * as userService from '../../service/userService';
import { StatusCodes } from 'http-status-codes';

jest.mock('../../service/userService');

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user successfully', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    (userService.registerUser as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/v1/users/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toEqual(mockUser);
    expect(userService.registerUser).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should fail registration with invalid data', async () => {
    const response = await request(app)
      .post('/api/v1/users/register')
      .send({ username: 't', email: 'invalid', password: 'short' });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should login a user successfully', async () => {
    const mockToken = 'mockJwtToken';
    (userService.loginUser as jest.Mock).mockResolvedValue(mockToken);

    const response = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({ token: mockToken });
    expect(userService.loginUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});