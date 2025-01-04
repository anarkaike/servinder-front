import { SupabaseClient } from '@supabase/supabase-js'
import { AuditableModel } from './BaseModel.js'

export class TradeableModel extends AuditableModel {
  static tableName = 'tradeables'
  
  id: string
  name: string
  description?: string
  type: 'product' | 'service' | 'space'
  status: 'active' | 'inactive' | 'deleted'
  price?: number
  owner_id: string
  metadata?: Record<string, any>
  created_at: Date
  created_by?: string
  updated_at?: Date
  updated_by?: string
  deleted_at?: Date
  deleted_by?: string

  constructor(supabase: SupabaseClient, data: Partial<TradeableModel>) {
    super(supabase)
    Object.assign(this, data)
  }

  // Exemplo de método que usa auditoria
  async markAsInactive(reason: string) {
    await this.update({
      status: 'inactive'
    })

    // Registrar um evento de auditoria personalizado
    await this.logAudit({
      event: 'updated',
      old_values: { status: 'active' },
      new_values: { status: 'inactive' },
      tags: { reason }
    })
  }

  // Exemplo de método que busca histórico de auditoria
  async getHistory() {
    return this.getAuditHistory()
  }

  // Método estático para buscar com soft delete
  static async findById(supabase: SupabaseClient, id: string, includeSoftDeleted = false) {
    const query = supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)

    if (!includeSoftDeleted) {
      query.is('deleted_at', null)
    }

    const { data, error } = await query.single()

    if (error) throw error
    if (!data) return null

    return new this(supabase, data)
  }

  // Método estático para listar com soft delete
  static async list(supabase: SupabaseClient, options: {
    includeSoftDeleted?: boolean
    page?: number
    limit?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
  } = {}) {
    const {
      includeSoftDeleted = false,
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = options

    const query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })

    if (!includeSoftDeleted) {
      query.is('deleted_at', null)
    }

    const { data, error, count } = await query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    return {
      data: data.map(item => new this(supabase, item)),
      total: count || 0,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0
    }
  }
}
