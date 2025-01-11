import { db } from '@/core/database/db';
import { product } from '../models/product';
import { service } from '../models/service';
import { movement } from '../models/movement';
import { accountVault } from '../models/accountVault';
import { eq, and } from 'drizzle-orm';
import type { Product, Service, Movement, AccountVault } from '../types';

export class CommerceService {
  private static instance: CommerceService;

  private constructor() {}

  public static getInstance(): CommerceService {
    if (!CommerceService.instance) {
      CommerceService.instance = new CommerceService();
    }
    return CommerceService.instance;
  }

  async getProducts(tenantId: string): Promise<Product[]> {
    return db.query.product.findMany({
      where: eq(product.tenantId, tenantId),
    });
  }

  async getServices(tenantId: string): Promise<Service[]> {
    return db.query.service.findMany({
      where: eq(service.tenantId, tenantId),
    });
  }

  async createMovement(movementData: Partial<Movement>): Promise<Movement> {
    const result = await db.insert(movement)
      .values(movementData)
      .returning();
    
    return result[0];
  }

  async getAccountBalance(accountId: string): Promise<number> {
    const movements = await db.query.movement.findMany({
      where: eq(movement.accountId, accountId),
    });

    return movements.reduce((balance, mov) => {
      return balance + (mov.type === 'credit' ? mov.amount : -mov.amount);
    }, 0);
  }
}

export const commerceService = CommerceService.getInstance();
