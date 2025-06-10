import request from 'supertest';
import app from '../../server';
import * as blogService from '../../service/blogService';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

jest.mock('../../service/blogService');
jest.mock('jsonwebtoken');

describe('Blog Controller', () => {
  const mockToken = 'mockJwtToken';
  const mockUser = { id: 'user-uuid' };

  beforeEach(() => {
    jest.clearAllMocks();
    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, mockUser);
    });
  });

  it('should create a blog successfully', async () => {
    const mockBlog = { id: 'blog-uuid', title: 'Test Blog', content: 'Test Content', authorId: mockUser.id };
    (blogService.createBlog as jest.Mock).mockResolvedValue(mockBlog);

    const response = await request(app)
      .post('/api/v1/blogs')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ title: 'Test Blog', content: 'Test Content', authorId: mockUser.id });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.body).toEqual(mockBlog);
    expect(blogService.createBlog).toHaveBeenCalledWith({
      title: 'Test Blog',
      content: 'Test Content',
      authorId: mockUser.id
    });
  });

  it('should fail to create a blog with invalid data', async () => {
    const response = await request(app)
      .post('/api/v1/blogs')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ title: 'T', content: 'Short' });

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should get a blog by ID', async () => {
    const mockBlog = { id: 'blog-uuid', title: 'Test Blog', content: 'Test Content', authorId: mockUser.id };
    (blogService.getBlogById as jest.Mock).mockResolvedValue(mockBlog);

    const response = await request(app).get('/api/v1/blogs/blog-uuid');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual(mockBlog);
    expect(blogService.getBlogById).toHaveBeenCalledWith('blog-uuid');
  });

  it('should fail to get a non-existent blog', async () => {
    (blogService.getBlogById as jest.Mock).mockRejectedValue(new Error('Blog not found'));

    const response = await request(app).get('/api/v1/blogs/non-existent');

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });
});