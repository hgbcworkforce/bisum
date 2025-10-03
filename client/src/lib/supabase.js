import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database table names
export const TABLES = {
  ATTENDEES: 'attendees',
  PAYMENTS: 'payments',
  SESSIONS: 'sessions',
  ADMINS: 'admins'
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)

  if (error?.code) {
    switch (error.code) {
      case '23505':
        return 'This record already exists. Please check for duplicates.'
      case '23503':
        return 'Invalid reference. Please check your data.'
      case '42501':
        return 'Permission denied. Please check your access rights.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }

  return error.message || 'An unexpected error occurred.'
}

// Helper function to generate registration number
export const generateRegistrationNumber = async () => {
  try {
    const year = new Date().getFullYear()

    // Get count of existing attendees
    const { count, error } = await supabase
      .from(TABLES.ATTENDEES)
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    const nextNumber = (count || 0) + 1
    return `BISUM/${year}/${String(nextNumber).padStart(4, '0')}`
  } catch (error) {
    console.error('Error generating registration number:', error)
    // Fallback to timestamp-based number
    const timestamp = Date.now().toString().slice(-4)
    return `BISUM/${new Date().getFullYear()}/${timestamp}`
  }
}

// Registration status options
export const REGISTRATION_TYPES = {
  STUDENT: 'student',
  PROFESSIONAL: 'professional',
  SPEAKER: 'speaker',
  SPONSOR: 'sponsor'
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

export const ATTENDEE_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
}

// Price configuration (in Naira)
export const REGISTRATION_PRICES = {
  [REGISTRATION_TYPES.STUDENT]: 15000,
  [REGISTRATION_TYPES.PROFESSIONAL]: 25000,
  [REGISTRATION_TYPES.SPEAKER]: 0, // Free for speakers
  [REGISTRATION_TYPES.SPONSOR]: 0  // Free for sponsors
}
