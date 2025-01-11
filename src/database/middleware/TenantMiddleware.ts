import { useAuthStore } from '../../stores/auth';
import { db } from '../db/db';
import { tenant } from '../entities';
import { user } from '../entities';
import { InferModel } from "drizzle-orm";
import { eq } from 'drizzle-orm';

export type User = InferModel<typeof user>;
export class TenantMiddleware {
  private static instance: TenantMiddleware;
  private currentTenant: any = null;

  private constructor() {}

  public static getInstance(): TenantMiddleware {
    if (!TenantMiddleware.instance) {
      TenantMiddleware.instance = new TenantMiddleware();
    }
    return TenantMiddleware.instance;
  }

  public async setTenantFromUser() {
    const authStore = useAuthStore();
    if (!authStore.user) return;

    const userWithTenant = await db.query.user.findFirst({
      where: eq(user.id, authStore.user.id),
      with: {
        tenant: true
      }
    });

    if (userWithTenant?.tenant) {
      this.currentTenant = userWithTenant.tenant;
    }
  }

  public getCurrentTenant() {
    return this.currentTenant;
  }

  public getCurrentTenantId() {
    return this.currentTenant?.id;
  }

  public async getTenantByDomain(domain: string) {
    return await db.query.tenant.findFirst({
      where: eq(tenant.domain, domain)
    });
  }
}

export const tenantMiddleware = TenantMiddleware.getInstance();
