import { UserService } from '../services/UserService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async create(req: any, res: any) {
    try {
      const user = await this.userService.createUser(req.body);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ error: 'Error creating user' });
    }
  }

  async getById(req: any, res: any) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: 'Error fetching user' });
    }
  }

  async update(req: any, res: any) {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ error: 'Error updating user' });
    }
  }

  async delete(req: any, res: any) {
    try {
      const deleted = await this.userService.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: 'Error deleting user' });
    }
  }
}
