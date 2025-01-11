import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { supabase } from '@/boot/supabase';
import { useTenantStore } from '@/stores/tenant';
import { useAuthStore } from '@/stores/auth';
import { db } from '@/core/database/db';
import { tenant, user } from '@/core/database/entities';
import { eq } from 'drizzle-orm';
import { InferModel } from 'drizzle-orm';

export type User = InferModel<typeof user>;

export class TenantMiddleware {
  private static instance: TenantMiddleware;
  private currentTenant: any = null;
  private tenantCache: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): TenantMiddleware {
    if (!TenantMiddleware.instance) {
      TenantMiddleware.instance = new TenantMiddleware();
    }
    return TenantMiddleware.instance;
  }

  public async routeMiddleware(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) {
    const hostname = window.location.hostname;
    const tenantStore = useTenantStore();
    const isDev = hostname === 'localhost' || hostname === '127.0.0.1';

    // Ignora rotas públicas
    if (to.meta.public) {
      return next();
    }

    // Em desenvolvimento, permite acesso direto
    if (isDev) {
      const devTenant = await this.getDevTenant();
      await this.updateTenantContext(devTenant.id);
      return next();
    }

    try {
      let tenant = await this.getTenantFromCache(hostname);
      
      if (!tenant) {
        const { data, error } = await supabase
          .from('tenant')
          .select('*')
          .eq('domain', hostname)
          .single();

        if (error || !data) {
          return next('/404');
        }

        tenant = data;
        await this.storeTenantInCache(hostname, tenant);
      }

      await this.updateTenantContext(tenant.id);
      return next();
    } catch (error) {
      console.error('Erro ao processar tenant:', error);
      return next('/error');
    }
  }

  public async databaseMiddleware() {
    const authStore = useAuthStore();
    const tenantStore = useTenantStore();
    
    if (!authStore.user || !tenantStore.currentTenant) {
      throw new Error('Usuário ou tenant não encontrado');
    }

    const userResult = await db.select()
      .from(user)
      .where(eq(user.id, authStore.user.id))
      .execute();

    if (!userResult.length) {
      throw new Error('Usuário não encontrado no banco de dados');
    }

    return {
      tenantId: tenantStore.currentTenant.id,
      userId: authStore.user.id
    };
  }

  private async updateTenantContext(tenantId: string): Promise<void> {
    const tenantStore = useTenantStore();
    const tenantData = await db.select()
      .from(tenant)
      .where(eq(tenant.id, tenantId))
      .execute();
    
    if (tenantData.length) {
      tenantStore.setTenant(tenantData[0]);
    }
  }

  private async getDevTenant() {
    const devTenant = await db.select()
      .from(tenant)
      .where(eq(tenant.name, 'Development'))
      .execute();
    
    if (!devTenant.length) {
      throw new Error('Tenant de desenvolvimento não encontrado');
    }
    
    return devTenant[0];
  }

  private async getTenantFromCache(hostname: string): Promise<any> {
    return this.tenantCache.get(hostname);
  }

  private async storeTenantInCache(hostname: string, tenant: any): Promise<void> {
    this.tenantCache.set(hostname, tenant);
  }
}

export const tenantMiddleware = TenantMiddleware.getInstance();
