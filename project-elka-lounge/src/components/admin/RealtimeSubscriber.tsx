"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RealtimeSubscriber() {
  const router = useRouter();

  useEffect(() => {
    console.log('[REALTIME] Setting up subscription...');

    const channel = supabase
      .channel('reservations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reservations',
        },
        async (payload) => {
          console.log('[REALTIME] New reservation detected:', payload.new);
          
          // Fetch guest name
          const guestId = payload.new.guest_id;
          let guestName = 'Новый гость';
          
          try {
            const { data: guest } = await supabase
              .from('guests')
              .select('name')
              .eq('id', guestId)
              .single();
            
            if (guest?.name) {
              guestName = guest.name;
            }
          } catch (err) {
            console.error('[REALTIME] Error fetching guest:', err);
          }

          toast.success('🔔 Новая бронь!', {
            description: `Гость: ${guestName}`,
            duration: 5000,
          });

          // Refresh the page data
          router.refresh();
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] Subscription status:', status);
      });

    return () => {
      console.log('[REALTIME] Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
