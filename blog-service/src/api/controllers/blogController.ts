import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as blogService from '../../service/blogService';

export const createBlog = async (req: Request, res: Response) => {
  try {
    const blog = await blogService.createBlog({ ...req.body, authorId: (req as any).user.id });
    res.status(StatusCodes.CREATED).json(blog);
  } catch (error : any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getBlog = async (req: Request, res: Response) => {
  try {
    const blog = await blogService.getBlogById(req.params.id);
    res.status(StatusCodes.OK).json(blog);
  } catch (error : any) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const blog = await blogService.updateBlog(req.params.id, (req as any).user.id, req.body);
    res.status(StatusCodes.OK).json(blog);
  } catch (error : any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    await blogService.deleteBlog(req.params.id, (req as any).user.id);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error : any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};