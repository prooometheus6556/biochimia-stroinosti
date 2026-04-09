"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Reservation } from '@/app/actions/admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Reservation;
  old?: { id: string };
}

interface RealtimeListenerProps {
  onRealtimeUpdate: (payload: RealtimePayload) => void;
}

export default function RealtimeListener({ onRealtimeUpdate }: RealtimeListenerProps) {
  const router = useRouter();

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) {
      console.warn("Realtime disabled: Missing NEXT_PUBLIC_SUPABASE keys");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[REALTIME] Setting up subscription for ALL events...');

    const channel = supabase.channel('admin-reservations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        async (payload) => {
          console.log('[REALTIME] Event detected:', payload.eventType, payload);
          
          const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
          
          if (eventType === 'DELETE') {
            onRealtimeUpdate({ eventType, old: payload.old as { id: string } });
          } else if (eventType === 'UPDATE' || eventType === 'INSERT') {
            const newRecord = payload.new as { id: string } | undefined;
            if (!newRecord?.id) return;
            
            const { data: reservation } = await supabase
              .from('reservations')
              .select('*, guest:guests (*)')
              .eq('id', newRecord.id)
              .single();
            
            if (reservation) {
              onRealtimeUpdate({ eventType, new: reservation as unknown as Reservation });
            }
          }
          
          router.refresh();
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] Subscription status:', status);
      });

    return () => {
      console.log('[REALTIME] Cleaning up...');
      supabase.removeChannel(channel);
    };
  }, [router, onRealtimeUpdate]);

  return null;
}
