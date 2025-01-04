import { User, UserModel } from '../models/User';

export class UserService {
  private users: User[] = [];

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser = new UserModel({
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    this.users.push(newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;

    const currentUser = this.users[userIndex]!;
    const updatedUser = new UserModel({
      id: currentUser.id,
      name: userData.name ?? currentUser.name,
      email: userData.email ?? currentUser.email,
      password: userData.password ?? currentUser.password,
      createdAt: currentUser.createdAt,
      updatedAt: new Date()
    });

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }
}
