import { supabase } from './supabase';
import { Attendee, ApiResponse } from '../types';

export const getAttendees = async (): Promise<ApiResponse<Attendee[]>> => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching attendees:', error);
    return { success: false, error: error.message };
  }
};

export const createAttendee = async (attendeeData: Attendee): Promise<ApiResponse<Attendee>> => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert([attendeeData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating attendee:', error);
    return { success: false, error: error.message };
  }
};
