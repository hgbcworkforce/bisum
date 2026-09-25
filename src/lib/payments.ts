import { supabase } from './supabase';
import { PaymentRecord, ApiResponse } from '../types';

export const getPayments = async (): Promise<ApiResponse<PaymentRecord[]>> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return { success: false, error: error.message };
  }
};

export const recordPayment = async (paymentData: Partial<PaymentRecord>): Promise<ApiResponse<PaymentRecord>> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return { success: false, error: error.message };
  }
};
