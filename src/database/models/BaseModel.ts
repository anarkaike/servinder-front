import { SupabaseClient } from '@supabase/supabase-js'
import { withAuditing } from '../utils/withAuditing.js'

export class BaseModel {
  protected supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  // Método para soft delete
  async delete() {
    const tableName = (this.constructor as any).tableName
    const id = (this as any).id

    if (!tableName || !id) {
      throw new Error('Model must have tableName and id')
    }

    const { error } = await this.supabase
      .from(tableName)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: await this.getCurrentUserId()
      })
      .eq('id', id)

    if (error) throw error
  }

  // Método para restaurar um registro soft deleted
  async restore() {
    const tableName = (this.constructor as any).tableName
    const id = (this as any).id

    if (!tableName || !id) {
      throw new Error('Model must have tableName and id')
    }

    const { error } = await this.supabase
      .from(tableName)
      .update({
        deleted_at: null,
        deleted_by: null
      })
      .eq('id', id)

    if (error) throw error
  }

  // Método para atualizar com auditoria
  async update(data: Record<string, any>) {
    const tableName = (this.constructor as any).tableName
    const id = (this as any).id

    if (!tableName || !id) {
      throw new Error('Model must have tableName and id')
    }

    const { error } = await this.supabase
      .from(tableName)
      .update({
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: await this.getCurrentUserId()
      })
      .eq('id', id)

    if (error) throw error
  }

  // Método estático para criar com auditoria
  static async create(this: any, supabase: SupabaseClient, data: Record<string, any>) {
    const { data: user } = await supabase.auth.getUser()
    
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert({
        ...data,
        created_by: user.user?.id
      })
      .select()
      .single()

    if (error) throw error

    return new this(supabase, result)
  }

  // Método para obter o usuário atual
  protected async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user?.id || null
  }
}

// Adicionar capacidade de auditoria ao BaseModel
export const AuditableModel = withAuditing(BaseModel)
