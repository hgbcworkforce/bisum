import { supabase } from '../lib/supabase';
import { Attendee, PaymentRecord, AdminUser, ApiResponse, MerchandiseOrder } from '../types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const formatCurrency = (amount: number | string): string => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(num);
};

export const handleApiError = (error: any): { message: string; details?: any } => {
  console.error('API Error:', error);
  if (typeof error === 'string') return { message: error };
  if (error?.message) return { message: error.message, details: error };
  return { message: 'An unexpected error occurred. Please try again.' };
};

/**
 * Registration API Service
 */
export const registrationAPI = {
  /**
   * Initiates payment or completes free registration via the Node.js backend
   */
  initiate: async (formData: any): Promise<ApiResponse<{ authorizationUrl?: string; accessCode?: string; reference?: string; registration?: Attendee; isFree?: boolean }>> => {
    try {
      const res = await fetch(`${API_BASE_URL}/registration/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to initiate registration');
      }

      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Retrieves registration status by reference
   */
  getStatus: async (reference: string): Promise<ApiResponse<Attendee>> => {
    try {
      const res = await fetch(`${API_BASE_URL}/registration/status/${encodeURIComponent(reference)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch status');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Fallback Supabase direct list for attendees
   */
  getAll: async (params?: { limit?: number }): Promise<ApiResponse<Attendee[]>> => {
    try {
      let query = supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formatted: Attendee[] = (data || []).map((r: any) => ({
        id: r.id,
        registrationNumber: r.registration_number,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone,
        registrationType: r.registration_type,
        breakoutSessionChoice: r.breakout_session_choice,
        createdAt: r.created_at,
        amountPaid: r.amount_paid,
        paymentStatus: r.payment_status,
      }));

      return { success: true, data: formatted };
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Fallback direct Supabase registration write (if backend is offline)
   */
  register: async (formData: any): Promise<ApiResponse<Attendee>> => {
    try {
      // First try backend initiate
      const backendRes = await registrationAPI.initiate({
        ...formData,
        amount: formData.amountPaid || 0,
      });

      if (backendRes.success && backendRes.data?.registration) {
        return {
          success: true,
          data: backendRes.data.registration,
        };
      }

      // Fallback direct write to Supabase
      const regNumber = 'BISUM-2025-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || '',
        registration_type: formData.registrationType || 'student',
        breakout_session_choice: formData.breakoutSessionChoice || 'General',
        registration_number: regNumber,
        payment_status: formData.paymentStatus || 'paid',
        amount_paid: formData.amountPaid || 1000,
      };

      const { data, error } = await supabase
        .from('registrations')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          registrationNumber: data.registration_number,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          registrationType: data.registration_type,
          breakoutSessionChoice: data.breakout_session_choice,
          createdAt: data.created_at,
        },
      };
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },
};

/**
 * Payment API Service
 */
export const paymentAPI = {
  /**
   * Verifies transaction with the Node.js backend
   */
  verifyTransaction: async (reference: string): Promise<ApiResponse<{ verified: boolean; registration?: Attendee }>> => {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/verify/${encodeURIComponent(reference)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Payment verification failed');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  getAll: async (params?: { limit?: number }): Promise<ApiResponse<PaymentRecord[]>> => {
    try {
      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },
};

/**
 * Admin API Service (Protected via Supabase Auth JWT)
 */
export const adminAPI = {
  /**
   * Gets active auth token from Supabase session
   */
  getAuthHeader: async (): Promise<Record<string, string>> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return {};
    return {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  },

  /**
   * Fetches dashboard metrics & stats
   */
  getMetrics: async (): Promise<ApiResponse<any>> => {
    try {
      const headers = await adminAPI.getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/admin/metrics`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch metrics');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Fetches paginated attendees with search/filter
   */
  getAttendees: async (params?: { search?: string; status?: string; registrationType?: string; breakoutSession?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> => {
    try {
      const headers = await adminAPI.getAuthHeader();
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE_URL}/admin/attendees?${query}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch attendees');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Updates attendee details
   */
  updateAttendee: async (id: string, updates: Partial<Attendee>): Promise<ApiResponse<any>> => {
    try {
      const headers = await adminAPI.getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/admin/attendees/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update attendee');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Deletes attendee record
   */
  deleteAttendee: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const headers = await adminAPI.getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/admin/attendees/${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete attendee');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Re-sends registration confirmation email
   */
  resendEmail: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const headers = await adminAPI.getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/admin/attendees/${id}/resend-email`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send email');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Fetches payment logs
   */
  getPayments: async (params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> => {
    try {
      const headers = await adminAPI.getAuthHeader();
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE_URL}/admin/payments?${query}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch payments');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Fetches merchandise orders (Admin)
   */
  getMerchandiseOrders: async (params?: { search?: string; paymentStatus?: string; fulfillmentStatus?: string; itemId?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> => {
    try {
      const headers = await adminAPI.getAuthHeader();
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE_URL}/admin/merchandise/orders?${query}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch merchandise orders');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Updates merchandise order status (Admin)
   */
  updateMerchandiseOrder: async (id: string, updates: Partial<MerchandiseOrder>): Promise<ApiResponse<any>> => {
    try {
      const headers = await adminAPI.getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/admin/merchandise/orders/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update order');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Deletes merchandise order (Admin)
   */
  deleteMerchandiseOrder: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const headers = await adminAPI.getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/admin/merchandise/orders/${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete order');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Re-sends merchandise order confirmation email (Admin)
   */
  resendMerchandiseEmail: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const headers = await adminAPI.getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/admin/merchandise/orders/${id}/resend-email`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend email');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },
};

/**
 * Merchandise API Service
 */
export const merchandiseAPI = {
  /**
   * Initiates merchandise checkout via the backend
   */
  initiate: async (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    itemId: string;
    itemName: string;
    color: string;
    size: string;
    quantity: number;
    unitPrice: number;
    pickupOption?: string;
    callbackUrl?: string;
  }): Promise<ApiResponse<{ authorizationUrl?: string; accessCode?: string; reference?: string; orderId?: string; totalAmount?: number }>> => {
    try {
      const res = await fetch(`${API_BASE_URL}/merchandise/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to initiate merchandise order');
      }

      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Retrieves merchandise order status by reference
   */
  getStatus: async (reference: string): Promise<ApiResponse<MerchandiseOrder>> => {
    try {
      const res = await fetch(`${API_BASE_URL}/merchandise/status/${encodeURIComponent(reference)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch order status');
      return data;
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },

  /**
   * Fallback Supabase direct list for merchandise orders
   */
  getAll: async (params?: { limit?: number }): Promise<ApiResponse<MerchandiseOrder[]>> => {
    try {
      let query = supabase
        .from('merchandise_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, message: err.message, error: err };
    }
  },
};
