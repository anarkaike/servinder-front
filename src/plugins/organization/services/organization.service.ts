import { db } from '@/core/database/db';
import { tenant } from '../models/tenant';
import { space } from '../models/space';
import { eq } from 'drizzle-orm';
import type { Tenant, Space } from '../types';

export class OrganizationService {
  private static instance: OrganizationService;

  private constructor() {}

  public static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const result = await db.query.tenant.findFirst({
      where: eq(tenant.domain, domain),
      with: {
        spaces: true,
      },
    });
    return result;
  }

  async getSpaces(tenantId: string): Promise<Space[]> {
    return db.query.space.findMany({
      where: eq(space.tenantId, tenantId),
    });
  }

  async createSpace(spaceData: Partial<Space>): Promise<Space> {
    const result = await db.insert(space)
      .values(spaceData)
      .returning();
    
    return result[0];
  }

  async updateTenantSettings(tenantId: string, settings: any): Promise<Tenant> {
    const result = await db.update(tenant)
      .set({ 
        settings: JSON.stringify(settings),
        updatedAt: new Date()
      })
      .where(eq(tenant.id, tenantId))
      .returning();
    
    return result[0];
  }
}

export const organizationService = OrganizationService.getInstance();
