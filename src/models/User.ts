import { eq } from 'drizzle-orm'
import { supabase } from 'src/boot/supabase'
import { users } from 'src/db/schema'

export interface UserAttributes {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export class User {
  static async getCurrentUser(): Promise<UserAttributes | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('users')
      .select()
      .eq('id', user.id)
      .single()

    return data
  }

  static async signUp(credentials: { email: string; password: string; name: string }) {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password
    })

    if (signUpError) throw signUpError

    if (user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: credentials.email,
          name: credentials.name
        })

      if (profileError) throw profileError
    }

    return user
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

  static async update(id: string, data: Partial<UserAttributes>) {
    const { data: updated, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  static async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) throw error
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }
}
