import { UserService } from '../services/UserService';
import { User } from '../models/User';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const user = await this.userService.createUser(userData);
      return user;
    } catch (error) {
      throw new Error('Error creating user');
    }
  }

  async getById(id: string) {
    try {
      const user = await this.userService.getUserById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error('Error fetching user');
    }
  }

  async update(id: string, userData: Partial<User>) {
    try {
      const user = await this.userService.updateUser(id, userData);
      return user;
    } catch (error) {
      throw new Error('Error updating user');
    }
  }

  async delete(id: string) {
    try {
      await this.userService.deleteUser(id);
    } catch (error) {
      throw new Error('Error deleting user');
    }
  }

  async getAll() {
    try {
      const users = await this.userService.getAllUsers();
      return users;
    } catch (error) {
      throw new Error('Error fetching users');
    }
  }
}
