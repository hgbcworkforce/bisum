import { supabaseAdmin } from '../config/supabase';
import { Attendee } from '../types';

export const attendeeService = {
  /**
   * Generates a unique conference registration code
   */
  generateRegistrationCode(): string {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `BISUM-2025-${randomDigits}`;
  },

  /**
   * Creates or updates a pending registration in the database without creating duplicate rows
   */
  async createPendingRegistration(payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender?: string;
    ageRange?: string;
    referralSource?: string;
    breakoutSessionChoice?: string;
    expectations?: string;
    registrationType: string;
    amountPaid: number;
    paymentReference: string;
  }) {
    const cleanEmail = payload.email.toLowerCase().trim();

    // 1. Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      // If already paid or free, prevent double registration
      if (existingUser.payment_status === 'paid' || existingUser.payment_status === 'free') {
        throw new Error(`This email (${cleanEmail}) is already registered with Pass ID ${existingUser.registration_number}.`);
      }

      // If pending, UPDATE the existing record instead of creating a duplicate row
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('registrations')
        .update({
          first_name: payload.firstName,
          last_name: payload.lastName,
          phone: payload.phone.trim(),
          gender: payload.gender,
          age_range: payload.ageRange,
          referral_source: payload.referralSource,
          breakout_session_choice: payload.breakoutSessionChoice,
          expectations: payload.expectations,
          registration_type: payload.registrationType,
          amount_paid: payload.amountPaid,
          payment_reference: payload.paymentReference,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      return updated;
    }

    // 2. Otherwise insert a fresh record
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .insert([
        {
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: cleanEmail,
          phone: payload.phone.trim(),
          gender: payload.gender,
          age_range: payload.ageRange,
          referral_source: payload.referralSource,
          breakout_session_choice: payload.breakoutSessionChoice,
          expectations: payload.expectations,
          registration_type: payload.registrationType,
          amount_paid: payload.amountPaid,
          payment_status: 'pending',
          payment_reference: payload.paymentReference,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating pending registration:', error);
      throw error;
    }

    return data;
  },

  /**
   * Registers a free pass attendee (no payment required) with duplicate prevention
   */
  async createFreeRegistration(payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender?: string;
    ageRange?: string;
    referralSource?: string;
    breakoutSessionChoice?: string;
    expectations?: string;
    registrationType: string;
  }) {
    const cleanEmail = payload.email.toLowerCase().trim();

    // Check if already registered
    const { data: existingUser } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser && (existingUser.payment_status === 'paid' || existingUser.payment_status === 'free')) {
      return existingUser; // Return existing registration
    }

    const regNumber = this.generateRegistrationCode();

    if (existingUser) {
      // Convert existing pending record to confirmed free pass
      const { data: updated, error } = await supabaseAdmin
        .from('registrations')
        .update({
          registration_number: regNumber,
          first_name: payload.firstName,
          last_name: payload.lastName,
          phone: payload.phone.trim(),
          gender: payload.gender,
          age_range: payload.ageRange,
          referral_source: payload.referralSource,
          breakout_session_choice: payload.breakoutSessionChoice,
          expectations: payload.expectations,
          registration_type: payload.registrationType || 'free',
          amount_paid: 0,
          payment_status: 'free',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .insert([
        {
          registration_number: regNumber,
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: cleanEmail,
          phone: payload.phone.trim(),
          gender: payload.gender,
          age_range: payload.ageRange,
          referral_source: payload.referralSource,
          breakout_session_choice: payload.breakoutSessionChoice,
          expectations: payload.expectations,
          registration_type: payload.registrationType || 'free',
          amount_paid: 0,
          payment_status: 'free',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating free registration:', error);
      throw error;
    }

    return data;
  },

  /**
   * Confirms payment and completes registration
   */
  async confirmRegistrationByReference(reference: string, amountPaid?: number) {
    // 1. Fetch current registration
    const { data: registration, error: fetchErr } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('payment_reference', reference)
      .single();

    if (fetchErr || !registration) {
      throw new Error(`Registration not found for reference: ${reference}`);
    }

    // If already confirmed, return existing registration
    if (registration.payment_status === 'paid' && registration.registration_number) {
      return registration;
    }

    // 2. Generate registration code if not present
    const regNumber = registration.registration_number || this.generateRegistrationCode();

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('registrations')
      .update({
        payment_status: 'paid',
        registration_number: regNumber,
        amount_paid: amountPaid !== undefined ? amountPaid : registration.amount_paid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', registration.id)
      .select()
      .single();

    if (updateErr) {
      console.error('Error confirming registration:', updateErr);
      throw updateErr;
    }

    return updated;
  },

  /**
   * Confirms payment by ID (e.g. from Paystack metadata)
   */
  async confirmRegistrationById(id: string, amountPaid: number) {
    const { data: registration, error: fetchErr } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !registration) {
      throw new Error(`Registration not found for id: ${id}`);
    }

    if (registration.payment_status === 'paid' && registration.registration_number) {
      return registration;
    }

    const regNumber = registration.registration_number || this.generateRegistrationCode();

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('registrations')
      .update({
        payment_status: 'paid',
        registration_number: regNumber,
        amount_paid: amountPaid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    return updated;
  },

  /**
   * Marks email as sent for attendee
   */
  async markEmailSent(id: string) {
    await supabaseAdmin.from('registrations').update({ email_sent: true }).eq('id', id);
  },

  /**
   * Retrieves an attendee by payment reference
   */
  async getByReference(reference: string) {
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('payment_reference', reference)
      .single();

    if (error) return null;
    return data;
  },

  /**
   * Retrieves an attendee by ID
   */
  async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  /**
   * Paginated list and search for admin dashboard
   */
  async listAttendees(params: {
    search?: string;
    status?: string;
    registrationType?: string;
    breakoutSession?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin.from('registrations').select('*', { count: 'exact' });

    if (params.search) {
      const s = `%${params.search}%`;
      query = query.or(`first_name.ilike.${s},last_name.ilike.${s},email.ilike.${s},registration_number.ilike.${s},phone.ilike.${s}`);
    }

    if (params.status && params.status !== 'all') {
      query = query.eq('payment_status', params.status);
    }

    if (params.registrationType && params.registrationType !== 'all') {
      query = query.eq('registration_type', params.registrationType);
    }

    if (params.breakoutSession && params.breakoutSession !== 'all') {
      query = query.eq('breakout_session_choice', params.breakoutSession);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      attendees: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  /**
   * Updates an attendee record (Admin)
   */
  async updateAttendee(id: string, updates: Partial<Attendee>) {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.firstName) payload.first_name = updates.firstName;
    if (updates.lastName) payload.last_name = updates.lastName;
    if (updates.email) payload.email = updates.email;
    if (updates.phone) payload.phone = updates.phone;
    if (updates.gender) payload.gender = updates.gender;
    if (updates.ageRange) payload.age_range = updates.ageRange;
    if (updates.breakoutSessionChoice) payload.breakout_session_choice = updates.breakoutSessionChoice;
    if (updates.registrationType) payload.registration_type = updates.registrationType;
    if (updates.paymentStatus) payload.payment_status = updates.paymentStatus;

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deletes an attendee record (Admin)
   */
  async deleteAttendee(id: string) {
    const { error } = await supabaseAdmin.from('registrations').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  /**
   * Dashboard Analytics & Metrics
   */
  async getDashboardAnalytics() {
    const [attendeesResult, paymentsResult] = await Promise.all([
      supabaseAdmin.from('registrations').select('id, payment_status, registration_type, breakout_session_choice, amount_paid, created_at'),
      supabaseAdmin.from('payments').select('id, amount, status, created_at'),
    ]);

    const attendees = attendeesResult.data || [];
    const payments = paymentsResult.data || [];

    const totalRegistrations = attendees.length;
    const paidRegistrations = attendees.filter((a) => a.payment_status === 'paid').length;
    const freeRegistrations = attendees.filter((a) => a.payment_status === 'free').length;
    const pendingRegistrations = attendees.filter((a) => a.payment_status === 'pending').length;

    const totalRevenue = attendees
      .filter((a) => a.payment_status === 'paid')
      .reduce((sum, a) => sum + (Number(a.amount_paid) || 0), 0);

    // Breakout sessions breakdown
    const sessionsMap: Record<string, number> = {};
    attendees.forEach((a) => {
      const choice = a.breakout_session_choice || 'General';
      sessionsMap[choice] = (sessionsMap[choice] || 0) + 1;
    });

    // Registration types breakdown
    const typesMap: Record<string, number> = {};
    attendees.forEach((a) => {
      const type = a.registration_type || 'regular';
      typesMap[type] = (typesMap[type] || 0) + 1;
    });

    return {
      totalRegistrations,
      paidRegistrations,
      freeRegistrations,
      pendingRegistrations,
      totalRevenue,
      sessionsBreakdown: sessionsMap,
      typesBreakdown: typesMap,
      totalPaymentsCount: payments.length,
    };
  },
};
