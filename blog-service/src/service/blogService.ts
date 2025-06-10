import { CreateBlogDtoType, UpdateBlogDtoType } from '../api/dtos/blogDto';
import * as blogRepository from '../repository/blogRepository';
import * as cache from '../cache/redis';

export const createBlog = async (blogData: CreateBlogDtoType) => {
  const blog = await blogRepository.createBlog(blogData);
  await cache.setBlog(blog.id, blog);
  return blog;
};

export const getBlogById = async (id: string) => {
  const cachedBlog = await cache.getBlog(id);
  if (cachedBlog) {
    return cachedBlog;
  }
  const blog = await blogRepository.findBlogById(id);
  if (!blog) {
    throw new Error('Blog not found');
  }
  await cache.setBlog(id, blog);
  return blog;
};

export const updateBlog = async (id: string, authorId: string, blogData: UpdateBlogDtoType) => {
  const blog = await blogRepository.findBlogById(id);
  if (!blog) {
    throw new Error('Blog not found');
  }
  if (blog.authorId !== authorId) {
    throw new Error('Unauthorized to update this blog');
  }
  const updatedBlog = await blogRepository.updateBlog(id, blogData);
  await cache.setBlog(id, updatedBlog);
  return updatedBlog;
};

export const deleteBlog = async (id: string, authorId: string) => {
  const blog = await blogRepository.findBlogById(id);
  if (!blog) {
    throw new Error('Blog not found');
  }
  if (blog.authorId !== authorId) {
    throw new Error('Unauthorized to delete this blog');
  }
  await blogRepository.deleteBlog(id);
  await cache.deleteBlog(id);
};