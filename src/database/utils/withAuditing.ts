import { SupabaseClient } from '@supabase/supabase-js'
import { AuditMiddleware, AuditEvent } from '../middleware/audit.js'

type Constructor<T = {}> = new (...args: any[]) => T

export function withAuditing<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    private auditMiddleware: AuditMiddleware

    constructor(...args: any[]) {
      super(...args)
      const supabase = args.find(arg => arg instanceof SupabaseClient)
      if (!supabase) {
        throw new Error('Supabase client is required for auditing')
      }
      this.auditMiddleware = new AuditMiddleware(supabase)
    }

    async getAuditHistory() {
      const id = (this as any).id
      const tableName = (this.constructor as any).tableName
      
      if (!id || !tableName) {
        throw new Error('Entity must have id and tableName for auditing')
      }

      return this.auditMiddleware.getAuditableHistory(tableName, id)
    }

    protected async logAudit(event: Omit<AuditEvent, 'auditable_type' | 'auditable_id'>) {
      const id = (this as any).id
      const tableName = (this.constructor as any).tableName
      
      if (!id || !tableName) {
        throw new Error('Entity must have id and tableName for auditing')
      }

      await this.auditMiddleware.logAudit({
        ...event,
        auditable_type: tableName,
        auditable_id: id
      })
    }
  }
}
