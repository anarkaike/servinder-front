import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { supabase } from '../boot/supabase';
import { useTenantStore } from '../stores/tenant';

export async function tenantDomainMiddleware(
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
    // Cria um tenant padrão para desenvolvimento
    const defaultTenant = {
      id: 'dev-tenant',
      name: 'Development Tenant',
      domain: hostname,
      settings: JSON.stringify({
        theme: 'light',
        features: ['all']
      })
    };
    tenantStore.setCurrentTenant(defaultTenant);
    return next();
  }

  try {
    // Verifica se já temos o tenant em cache
    const cachedTenant = await getTenantFromCache(hostname);
    if (cachedTenant) {
      tenantStore.setCurrentTenant(cachedTenant);
      if (!isDev) {
        await updateTenantContext(cachedTenant.id);
      }
      return next();
    }

    // Busca o tenant pelo domínio
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('domain', hostname)
      .single();

    if (error || !tenant) {
      console.error('Tenant não encontrado:', error);
      return next('/404');
    }

    // Armazena o tenant no cache
    await storeTenantInCache(hostname, tenant);
    tenantStore.setCurrentTenant(tenant);

    // Atualiza o contexto do tenant no Supabase apenas em produção
    if (!isDev) {
      await updateTenantContext(tenant.id);
    }

    next();
  } catch (error) {
    console.error('Erro ao processar tenant:', error);
    next('/error');
  }
}

async function updateTenantContext(tenantId: string): Promise<void> {
  try {
    await supabase.rpc('set_tenant_context', {
      p_tenant_id: tenantId
    });
  } catch (error) {
    console.error('Erro ao atualizar contexto do tenant:', error);
  }
}

async function getTenantFromCache(hostname: string): Promise<any> {
  const cacheKey = `tenant_${hostname}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { tenant, expiry } = JSON.parse(cached);
    if (expiry > Date.now()) {
      return tenant;
    }
    localStorage.removeItem(cacheKey);
  }
  return null;
}

async function storeTenantInCache(hostname: string, tenant: any): Promise<void> {
  const cacheKey = `tenant_${hostname}`;
  const expiry = Date.now() + (30 * 60 * 1000); // 30 minutos
  localStorage.setItem(cacheKey, JSON.stringify({ tenant, expiry }));
}
