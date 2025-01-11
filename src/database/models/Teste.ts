import { eq } from 'drizzle-orm'
import { supabase } from '@boot/supabase'
import { teste } from '@database/db/schema'

export class Teste {
  static async all() {
    const { data, error } = await supabase
      .from('teste')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async find(id: string) {
    const { data, error } = await supabase
      .from('teste')
      .select()
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(data: { name: string; email: string }) {
    const { data: created, error } = await supabase
      .from('teste')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return created
  }

  static async update(id: string, data: Partial<{ name: string; email: string }>) {
    const { data: updated, error } = await supabase
      .from('teste')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('teste')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Métodos de consulta mais avançados
  static async findByEmail(email: string) {
    const { data, error } = await supabase
      .from('teste')
      .select()
      .eq('email', email)
      .single()

    if (error) throw error
    return data
  }

  static async findRecent(limit = 10) {
    const { data, error } = await supabase
      .from('teste')
      .select()
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}
