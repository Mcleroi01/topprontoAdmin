import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
export const storage = supabase.storage
// Configurable storage bucket for job applications documents
export const JOB_APPLICATIONS_BUCKET = import.meta.env.VITE_SUPABASE_JOB_BUCKET || 'job-applications'

// Types for our database
export interface Driver {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  has_vehicle: boolean
  vehicle_type?: string
  license_number?: string
  experience_years: number
  status: 'pending' | 'approved' | 'rejected'
  message?: string
  created_at: string
  updated_at: string
}

export interface Enterprise {
  id: string
  name: string
  email: string
  phone: string
  contact_person: string
  position: string
  contact_method: string
  city: string
  industry: string
  vehicle_type: string
  monthly_deliveries: string
  order_preference: string
  message?: string
  status: 'new' | 'contacted' | 'converted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  is_read: boolean
  replied_at?: string
  created_at: string
}

export interface JobOffer {
  id: string
  title: string
  description: string
  location: string
  salary_range?: string
  employment_type: string
  requirements: string[]
  benefits: string[]
  is_active: boolean
  applications_count: number
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  job_offer_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  experience_years: number
  message?: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  job_offer?: JobOffer
}

export interface AdminUser {
  id: string
  user_id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}