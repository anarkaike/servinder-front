import { db } from '@/core/database/db';
import { menu } from '../models/menu';
import { menuLocation } from '../models/menuLocation';
import { eq, and } from 'drizzle-orm';
import type { Menu, MenuLocation } from '../types';

export class MenuService {
  private static instance: MenuService;

  private constructor() {}

  public static getInstance(): MenuService {
    if (!MenuService.instance) {
      MenuService.instance = new MenuService();
    }
    return MenuService.instance;
  }

  async getMenusByLocation(locationId: string, tenantId: string): Promise<Menu[]> {
    const menus = await db.query.menu.findMany({
      where: and(
        eq(menu.locationId, locationId),
        eq(menu.tenantId, tenantId)
      ),
      with: {
        children: true,
      },
      orderBy: menu.order,
    });

    return this.buildMenuTree(menus);
  }

  private buildMenuTree(menus: Menu[], parentId: string | null = null): Menu[] {
    return menus
      .filter(menu => menu.parentId === parentId)
      .map(menu => ({
        ...menu,
        children: this.buildMenuTree(menus, menu.id),
      }));
  }

  async createMenu(menuData: Partial<Menu>): Promise<Menu> {
    const result = await db.insert(menu)
      .values(menuData)
      .returning();
    
    return result[0];
  }

  async updateMenu(id: string, menuData: Partial<Menu>): Promise<Menu> {
    const result = await db.update(menu)
      .set({ ...menuData, updatedAt: new Date() })
      .where(eq(menu.id, id))
      .returning();
    
    return result[0];
  }
}

export const menuService = MenuService.getInstance();
