import { supabase } from '@boot/supabase'
import { teste } from '@database/db/schema'

export class Teste {
  static async all() {
    const { data, error } = await supabase
      .from('teste')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Erro ao buscar registros: ${error.message}`)
    return data
  }

  static async find(id: string) {
    const { data, error } = await supabase
      .from('teste')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(`Erro ao buscar registro: ${error.message}`)
    return data
  }

  static async create(data: { name: string; email: string }) {
    const { data: created, error } = await supabase
      .from('teste')
      .insert([data])
      .select()
      .single()

    if (error) throw new Error(`Erro ao criar registro: ${error.message}`)
    return created
  }

  static async update(id: string, data: { name?: string; email?: string }) {
    console.log('Teste.update() - Atualizando registro:', id, data)
    const { data: updated, error } = await supabase
      .from('teste')
      .update(data)
      .eq('id', id)
      .select('id, name, email')
      .single()

    if (error) {
      console.error('Teste.update() - Erro:', error)
      throw new Error(`Erro ao atualizar registro: ${error.message}`)
    }
    return updated
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('teste')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Erro ao deletar registro: ${error.message}`)
  }

  // Métodos de consulta mais avançados
  static async findByEmail(email: string) {
    const { data, error } = await supabase
      .from('teste')
      .select('*')
      .eq('email', email)
      .single()

    if (error) throw new Error(`Erro ao buscar registro por email: ${error.message}`)
    return data
  }

  static async findRecent(limit = 10) {
    const { data, error } = await supabase
      .from('teste')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Erro ao buscar registros recentes: ${error.message}`)
    return data
  }
}
