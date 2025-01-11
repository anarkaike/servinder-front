import { eq } from 'drizzle-orm'
import { supabase } from '@boot/supabase'
import { teste } from '@database/db/schema'

export class Teste {
  static async all() {
    console.log('Teste.all() - Iniciando busca de todos os registros')
    const { data, error } = await supabase
      .from('teste')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Teste.all() - Erro:', error)
      throw new Error(`Erro ao buscar registros: ${error.message}`)
    }
    
    console.log('Teste.all() - Registros encontrados:', data)
    return data
  }

  static async find(id: string) {
    console.log('Teste.find() - Buscando registro:', id)
    const { data, error } = await supabase
      .from('teste')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      console.error('Teste.find() - Erro:', error)
      throw new Error(`Erro ao buscar registro: ${error.message}`)
    }
    return data
  }

  static async create(data: { name: string; email: string }) {
    console.log('Teste.create() - Criando novo registro:', data)
    const { data: created, error } = await supabase
      .from('teste')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Teste.create() - Erro:', error)
      throw new Error(`Erro ao criar registro: ${error.message}`)
    }
    return created
  }

  static async update(id: string, data: Partial<{ name: string; email: string }>) {
    console.log('Teste.update() - Atualizando registro:', id, data)
    const { data: updated, error } = await supabase
      .from('teste')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Teste.update() - Erro:', error)
      throw new Error(`Erro ao atualizar registro: ${error.message}`)
    }
    return updated
  }

  static async delete(id: string) {
    console.log('Teste.delete() - Deletando registro:', id)
    const { error } = await supabase
      .from('teste')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Teste.delete() - Erro:', error)
      throw new Error(`Erro ao deletar registro: ${error.message}`)
    }
  }

  // Métodos de consulta mais avançados
  static async findByEmail(email: string) {
    console.log('Teste.findByEmail() - Buscando por email:', email)
    const { data, error } = await supabase
      .from('teste')
      .select()
      .eq('email', email)
      .single()

    if (error) {
      console.error('Teste.findByEmail() - Erro:', error)
      throw new Error(`Erro ao buscar por email: ${error.message}`)
    }
    return data
  }

  static async findRecent(limit = 10) {
    console.log('Teste.findRecent() - Buscando registros recentes, limite:', limit)
    const { data, error } = await supabase
      .from('teste')
      .select()
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Teste.findRecent() - Erro:', error)
      throw new Error(`Erro ao buscar registros recentes: ${error.message}`)
    }
    return data
  }
}
