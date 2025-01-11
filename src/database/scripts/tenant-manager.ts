import { db } from '../db';
import { tenant } from '../entities/Tenant';
import { user } from '../entities/User';
import { eq } from 'drizzle-orm';

export class TenantManager {
  static async createTenant(data: {
    name: string;
    domain: string;
    settings?: any;
  }) {
    return await db.insert(tenant).values({
      name: data.name,
      domain: data.domain,
      settings: data.settings ? JSON.stringify(data.settings) : null,
    }).returning();
  }

  static async assignUserToTenant(userId: string, tenantId: string) {
    return await db.update(user)
      .set({ tenantId })
      .where(eq(user.id, userId))
      .returning();
  }

  static async getTenantByDomain(domain: string) {
    return await db.query.tenant.findFirst({
      where: eq(tenant.domain, domain),
    });
  }

  static async listTenants() {
    return await db.select().from(tenant);
  }

  static async deleteTenant(id: string) {
    // Primeiro remove todas as referências ao tenant
    await db.update(user)
      .set({ tenantId: null })
      .where(eq(user.tenantId, id));

    // Depois remove o tenant
    return await db.delete(tenant)
      .where(eq(tenant.id, id))
      .returning();
  }
}
