import { User, UserModel } from '../models/User';

export class UserService {
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return UserModel.create(userData);
  }

  async getUserById(id: string): Promise<User | null> {
    return UserModel.getById(id);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return UserModel.update(id, userData);
  }

  async deleteUser(id: string): Promise<void> {
    return UserModel.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return UserModel.getAll();
  }
}
