import { supabase } from '../lib/supabase'
import type { Driver, Enterprise, Contact, JobOffer, JobApplication } from '../lib/supabase'

// Drivers API
export const driversApi = {
  getAll: async (filters?: { status?: string; search?: string }) => {
    let query = supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Driver[]
  },

  updateStatus: async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    const { data, error } = await supabase
      .from('drivers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Driver
  },

  getStats: async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('status')

    if (error) throw error

    const stats = {
      total: data.length,
      pending: data.filter(d => d.status === 'pending').length,
      approved: data.filter(d => d.status === 'approved').length,
      rejected: data.filter(d => d.status === 'rejected').length,
    }

    return stats
  }
}

// Enterprises API
export const enterprisesApi = {
  getAll: async (filters?: { status?: string; search?: string }) => {
    let query = supabase
      .from('enterprises')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Enterprise[]
  },

  updateStatus: async (id: string, status: 'new' | 'contacted' | 'converted' | 'rejected') => {
    const { data, error } = await supabase
      .from('enterprises')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Enterprise
  },

  getStats: async () => {
    const { data, error } = await supabase
      .from('enterprises')
      .select('status')

    if (error) throw error

    const stats = {
      total: data.length,
      new: data.filter(e => e.status === 'new').length,
      contacted: data.filter(e => e.status === 'contacted').length,
      converted: data.filter(e => e.status === 'converted').length,
      rejected: data.filter(e => e.status === 'rejected').length,
    }

    return stats
  }
}

// Contacts API
export const contactsApi = {
  getAll: async (filters?: { isRead?: boolean; search?: string }) => {
    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.isRead !== undefined) {
      query = query.eq('is_read', filters.isRead)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Contact[]
  },

  markAsRead: async (id: string) => {
    const { data, error } = await supabase
      .from('contacts')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Contact
  },

  getUnreadCount: async () => {
    const { count, error } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    if (error) throw error
    return count || 0
  }
}

// Job Offers API
export const jobOffersApi = {
  getAll: async (filters?: { isActive?: boolean; search?: string }) => {
    let query = supabase
      .from('job_offers')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data as JobOffer[]
  },

  create: async (jobOffer: Omit<JobOffer, 'id' | 'created_at' | 'updated_at' | 'applications_count'>) => {
    const { data, error } = await supabase
      .from('job_offers')
      .insert([jobOffer])
      .select()
      .single()

    if (error) throw error
    return data as JobOffer
  },

  update: async (id: string, updates: Partial<JobOffer>) => {
    const { data, error } = await supabase
      .from('job_offers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as JobOffer
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('job_offers')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  getActiveCount: async () => {
    const { count, error } = await supabase
      .from('job_offers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (error) throw error
    return count || 0
  }
}

// Job Applications API
export const jobApplicationsApi = {
  getByJobOffer: async (jobOfferId: string) => {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job_offer:job_offers(*)
      `)
      .eq('job_offer_id', jobOfferId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as (JobApplication & { job_offer: JobOffer })[]
  },

  updateStatus: async (id: string, status: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as JobApplication
  }
}