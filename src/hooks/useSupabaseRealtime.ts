import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useDashboardRealtime = () => {
  const [stats, setStats] = useState({
    totalAttendees: 0,
    totalRevenue: 0,
    studentCount: 0,
    professionalCount: 0,
    activeSessions: 6,
    isLive: true,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data: attendees, count: attendeeCount } = await supabase
          .from('registrations')
          .select('id, registration_type, payment_status', { count: 'exact' });

        const { data: payments } = await supabase
          .from('payments')
          .select('amount, status');

        let revenue = 0;
        if (payments) {
          payments.forEach((p: any) => {
            if (p.status === 'success' || p.status === 'paid') {
              revenue += Number(p.amount) || 0;
            }
          });
        }

        let studentCount = 0;
        let profCount = 0;
        if (attendees) {
          attendees.forEach((a: any) => {
            const t = (a.registration_type || '').toLowerCase();
            if (t === 'student') studentCount++;
            else if (t === 'professional') profCount++;
          });
        }

        setStats((prev) => ({
          ...prev,
          totalAttendees: attendeeCount || (studentCount + profCount),
          totalRevenue: revenue,
          studentCount,
          professionalCount: profCount,
        }));
      } catch (err) {
        console.warn('Realtime fetch fallback:', err);
      }
    };

    fetchCounts();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        fetchCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return stats;
};
