import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, AdminUser } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Initializing auth state...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }
      
      console.log('Initial session:', session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('User found, fetching admin data...')
        fetchAdminUser(session.user.id)
      } else {
        console.log('No user session found')
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      setUser(session?.user ?? null)
      
      if (session?.user) {
       
        fetchAdminUser(session.user.id)
      } else {
        console.log('Auth state changed - no user')
        setAdminUser(null)
        setLoading(false)
      }
    })

    return () => {
     
      subscription.unsubscribe()
    }
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
        setAdminUser(null)
      } else {
        
        setAdminUser(data)
      }
    } catch (error) {
      console.error('Exception in fetchAdminUser:', error)
      setAdminUser(null)
    } finally {
      setLoading(false)
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

  const isAdmin = Boolean(user && adminUser?.is_active)
 

  return {
    user,
    adminUser,
    loading,
    isAdmin,
    signIn,
    signOut,
  }
}