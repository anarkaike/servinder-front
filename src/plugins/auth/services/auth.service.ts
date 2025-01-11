import { db } from '@/core/database/db';
import { user } from '../models/user';
import { role } from '../models/role';
import { permission } from '../models/permission';
import { eq } from 'drizzle-orm';
import type { User, Role, Permission } from '../types';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async getUserWithRoles(userId: string): Promise<User & { roles: Role[] }> {
    const result = await db.query.user.findFirst({
      where: eq(user.id, userId),
      with: {
        roles: {
          with: {
            permissions: true,
          },
        },
      },
    });

    if (!result) {
      throw new Error('User not found');
    }

    return result;
  }

  async validatePermission(userId: string, permissionName: string): Promise<boolean> {
    const userRoles = await db.query.user.findFirst({
      where: eq(user.id, userId),
      with: {
        roles: {
          with: {
            permissions: true,
          },
        },
      },
    });

    if (!userRoles?.roles) return false;

    return userRoles.roles.some(role => 
      role.permissions.some(permission => permission.name === permissionName)
    );
  }
}

export const authService = AuthService.getInstance();
