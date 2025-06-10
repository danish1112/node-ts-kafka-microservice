import { RegisterUserDtoType, LoginUserDtoType } from '../api/dtos/userDto';
import * as userRepository from '../repository/userRepository';
import * as cache from '../cache/redis';
import { sendUserEvent } from '../kafka/producer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const registerUser = async (userData: RegisterUserDtoType) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await userRepository.createUser({
    ...userData,
    password: hashedPassword
  });
  await cache.setUser(user.id, user);
  await sendUserEvent({ type: 'user-registered', userId: user.id, username: user.username });
  return { id: user.id, username: user.username, email: user.email };
};

export const loginUser = async (userData: LoginUserDtoType) => {
  const user = await userRepository.findUserByEmail(userData.email);
  if (!user) {
    throw new Error('User not found');
  }
  const isPasswordValid = await bcrypt.compare(userData.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  await cache.setUser(user.id, user);
  return token;
};

export const getUserById = async (id: string) => {
  const cachedUser = await cache.getUser(id);
  if (cachedUser) {
    return cachedUser;
  }
  const user = await userRepository.findUserById(id);
  if (!user) {
    throw new Error('User not found');
  }
  await cache.setUser(id, user);
  return user;
};