import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, AdminUser } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchAdminUser(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchAdminUser(session.user.id)
      } else {
        setAdminUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchAdminUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching admin user:', error)
        return
      }

      setAdminUser(data)
    } catch (error) {
      console.error('Error fetching admin user:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Vérifier si l'utilisateur est admin uniquement quand on a fini de charger
  const isAdmin = !loading && !!user && !!adminUser?.is_active;

  return {
    user,
    adminUser,
    loading,
    isAdmin,
    signIn,
    signOut,
  }
}