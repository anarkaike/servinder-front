import { SQL, eq } from 'drizzle-orm';
import { tenantMiddleware } from './TenantMiddleware';

export function withTenantScope(table: any): SQL {
  const tenantId = tenantMiddleware.getCurrentTenantId();
  if (!tenantId) return undefined;
  return eq(table.tenantId, tenantId);
}

export function applyTenantScope(query: any, table: any) {
  const tenantScope = withTenantScope(table);
  if (tenantScope) {
    if (query.where) {
      return {
        ...query,
        where: SQL`${query.where} AND ${tenantScope}`
      };
    }
    return {
      ...query,
      where: tenantScope
    };
  }
  return query;
}
