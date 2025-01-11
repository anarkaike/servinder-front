import { eq } from 'drizzle-orm'
import { supabase } from '@boot/supabase'
import { user, User as UserType } from '@database/entities/User'

export interface UserCredentials {
  email: string
  password: string
  name: string
}

export class User {
  static async getCurrentUser(): Promise<UserType | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return null

    const { data } = await supabase
      .from('users')
      .select()
      .eq('id', authUser.id)
      .single()

    return data
  }

  static async signUp(credentials: UserCredentials) {
    const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name
        }
      }
    })

    if (signUpError) throw signUpError

    // Criar o usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser?.id,
        email: credentials.email,
        name: credentials.name,
      })
      .select()
      .single()

    if (userError) throw userError

    return userData
  }

  static async signIn(credentials: { email: string; password: string }) {
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) throw error
    return user
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async update(id: string, data: Partial<UserType>) {
    const { data: userData, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return userData
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
