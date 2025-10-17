import { supabase, TABLES, handleSupabaseError, generateRegistrationNumber, REGISTRATION_TYPES, ATTENDEE_STATUS } from './supabase.js'

// Create a new attendee registration
export const createAttendee = async (attendeeData) => {
  try {
    // Data is already transformed by supabaseService, so use it directly
    const newAttendee = {
      ...attendeeData,
      email: attendeeData.email.toLowerCase().trim(),
      phone: attendeeData.phone.trim(),
      payment_status: 'pending',
      status: ATTENDEE_STATUS.ACTIVE
    }

    const { data, error } = await supabase
      .from(TABLES.ATTENDEES)
      .insert(newAttendee)
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data,
      message: 'Registration successful!'
    }
  } catch (error) {
    console.error('Error creating attendee:', error)
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to register attendee'
    }
  }
}

// Get attendee by ID
export const getAttendeeById = async (id) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ATTENDEES)
      .select(`
        *,
        payments (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error fetching attendee:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Get attendee by email
export const getAttendeeByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ATTENDEES)
      .select(`
        *,
        payments (*)
      `)
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error fetching attendee by email:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Get attendee by registration number
export const getAttendeeByRegistrationNumber = async (registrationNumber) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ATTENDEES)
      .select(`
        *,
        payments (*)
      `)
      .eq('registration_number', registrationNumber)
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error fetching attendee by registration number:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Get all attendees with pagination and filtering
export const getAttendees = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      registrationType = null,
      paymentStatus = null,
      status = null,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options

    let query = supabase
      .from(TABLES.ATTENDEES)
      .select(`
        *,
        payments (*)
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,registration_number.ilike.%${search}%`
      )
    }

    if (registrationType) {
      query = query.eq('registration_type', registrationType)
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data,
      pagination: {
        total: count,
        page: page,
        limit: limit,
        pages: Math.ceil(count / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching attendees:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Update attendee
export const updateAttendee = async (id, updateData) => {
  try {
    const updates = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    // Handle email normalization
    if (updates.email) {
      updates.email = updates.email.toLowerCase().trim()
    }

    const { data, error } = await supabase
      .from(TABLES.ATTENDEES)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data,
      message: 'Attendee updated successfully'
    }
  } catch (error) {
    console.error('Error updating attendee:', error)
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to update attendee'
    }
  }
}

// Update attendee payment status
export const updateAttendeePaymentStatus = async (id, paymentStatus) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ATTENDEES)
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data,
      message: 'Payment status updated successfully'
    }
  } catch (error) {
    console.error('Error updating payment status:', error)
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to update payment status'
    }
  }
}

// Delete attendee (soft delete by updating status)
export const deleteAttendee = async (id) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ATTENDEES)
      .update({
        status: ATTENDEE_STATUS.CANCELLED,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data,
      message: 'Attendee registration cancelled'
    }
  } catch (error) {
    console.error('Error deleting attendee:', error)
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to cancel registration'
    }
  }
}

// Get registration statistics
export const getRegistrationStats = async () => {
  try {
    const { data, error } = await supabase
      .from('registration_stats')
      .select('*')
      .single();

    if (error) throw error;

    // Calculate breakout session popularity from the view data
    const sessionCounts = {
      investment: data.investment_session || 0,
      tech: data.tech_session || 0,
      fashion: data.fashion_session || 0,
      agriculture: data.agriculture_session || 0,
      foods: data.foods_session || 0,
    };

    const popularSession = Object.entries(sessionCounts).sort((a, b) => b[1] - a[1])[0];

    const stats = {
      totalRegistrations: data.total_registrations || 0,
      activeRegistrations: data.total_registrations || 0, // Assuming view only counts active
      pendingPayments: data.pending_payments || 0,
      completedPayments: data.completed_payments || 0,
      failedPayments: data.failed_payments || 0,
      byType: {
        student: data.student_count || 0,
        professional: data.professional_count || 0,
        speaker: data.speaker_count || 0,
        sponsor: data.sponsor_count || 0,
      },
      popularSession: {
        name: popularSession[0],
        count: popularSession[1],
      },
      paymentCompletionRate: data.total_registrations > 0
        ? ((data.completed_payments / data.total_registrations) * 100).toFixed(2)
        : 0,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Error fetching registration stats:', error);
    return {
      success: false,
      error: handleSupabaseError(error),
    };
  }
};

// Check if email is already registered
export const checkEmailExists = async (email) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ATTENDEES)
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return {
      success: true,
      exists: !!data
    }
  } catch (error) {
    console.error('Error checking email existence:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}

// Real-time subscription for attendee updates
export const subscribeToAttendees = (callback) => {
  const subscription = supabase
    .channel('attendees-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.ATTENDEES
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return subscription
}

// Export attendees to CSV format data
export const exportAttendeesToCSV = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.ATTENDEES)
      .select(`
        registration_number,
        first_name,
        last_name,
        email,
        phone,
        registration_type,
        payment_status,
        status,
        expectations,
        referral_source,
        breakout_session_choice,
        registration_date
      `)
      .order('registration_date', { ascending: false })

    if (error) {
      throw error
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error exporting attendees:', error)
    return {
      success: false,
      error: handleSupabaseError(error)
    }
  }
}
