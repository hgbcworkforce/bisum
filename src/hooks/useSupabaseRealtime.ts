import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
  totalRegistrations: number;
  totalAttendees: number; // backward compatibility alias
  totalMerchandisePurchased: number;
  totalRevenue: number;
  regRevenue: number;
  merchRevenue: number;
  pendingTransactions: number;
  studentCount: number;
  professionalCount: number;
  onsiteCount: number;
  onlineCount: number;
  paidRegistrations: number;
  paidMerchandiseOrders: number;
  activeSessions: number;
  isLive: boolean;
}

export const useDashboardRealtime = (): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    totalAttendees: 0,
    totalMerchandisePurchased: 0,
    totalRevenue: 0,
    regRevenue: 0,
    merchRevenue: 0,
    pendingTransactions: 0,
    studentCount: 0,
    professionalCount: 0,
    onsiteCount: 0,
    onlineCount: 0,
    paidRegistrations: 0,
    paidMerchandiseOrders: 0,
    activeSessions: 6,
    isLive: true,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [regRes, merchRes, payRes] = await Promise.all([
          supabase.from('registrations').select('id, registration_type, attendance_mode, payment_status, amount_paid'),
          supabase.from('merchandise_orders').select('id, quantity, total_amount, payment_status, fulfillment_status'),
          supabase.from('payments').select('id, amount, status'),
        ]);

        const attendees = regRes.data || [];
        const merchOrders = merchRes.data || [];
        const payments = payRes.data || [];

        // 1. Registrations stats
        let studentCount = 0;
        let profCount = 0;
        let onsiteCount = 0;
        let onlineCount = 0;
        let paidRegCount = 0;
        let pendingRegCount = 0;
        let regRevenue = 0;

        attendees.forEach((a: any) => {
          const t = (a.registration_type || '').toLowerCase();
          if (t === 'student') studentCount++;
          else if (t === 'professional') profCount++;

          const mode = (a.attendance_mode || 'On-site').toLowerCase();
          if (mode === 'online') {
            onlineCount++;
          } else {
            onsiteCount++;
          }

          const st = (a.payment_status || '').toLowerCase();
          if (st === 'paid') {
            paidRegCount++;
            regRevenue += Number(a.amount_paid) || (t === 'professional' ? 2000 : 1000);
          } else if (st === 'pending') {
            pendingRegCount++;
          }
        });

        // 2. Merchandise stats
        let totalMerchPurchased = 0;
        let paidMerchCount = 0;
        let pendingMerchCount = 0;
        let merchRevenue = 0;

        merchOrders.forEach((m: any) => {
          const st = (m.payment_status || '').toLowerCase();
          const qty = Number(m.quantity) || 1;
          const amt = Number(m.total_amount) || 0;

          if (st === 'paid' || st === 'success') {
            paidMerchCount++;
            totalMerchPurchased += qty;
            merchRevenue += amt;
          } else if (st === 'pending') {
            pendingMerchCount++;
          }
        });

        // 3. Combined Revenue (Settled Payments & direct fallback)
        let paymentsRevenue = 0;
        payments.forEach((p: any) => {
          const st = (p.status || '').toLowerCase();
          if (st === 'success' || st === 'paid') {
            paymentsRevenue += Number(p.amount) || 0;
          }
        });

        const combinedRevenue = Math.max(paymentsRevenue, regRevenue + merchRevenue);
        const combinedPending = pendingRegCount + pendingMerchCount;

        setStats({
          totalRegistrations: attendees.length,
          totalAttendees: attendees.length,
          totalMerchandisePurchased: totalMerchPurchased,
          totalRevenue: combinedRevenue,
          regRevenue,
          merchRevenue,
          pendingTransactions: combinedPending,
          studentCount,
          professionalCount: profCount,
          onsiteCount,
          onlineCount,
          paidRegistrations: paidRegCount,
          paidMerchandiseOrders: paidMerchCount,
          activeSessions: 6,
          isLive: true,
        });
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'merchandise_orders' }, () => {
        fetchCounts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return stats;
};
