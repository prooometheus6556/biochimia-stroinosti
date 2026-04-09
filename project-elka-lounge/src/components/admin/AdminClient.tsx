"use client";

import { useState, useCallback } from "react";
import Chessboard from "@/components/admin/Chessboard";
import UpcomingBookings from "@/components/admin/UpcomingBookings";
import StopList from "@/components/admin/StopList";
import RealtimeListener from "@/components/admin/RealtimeListener";
import { Table, Reservation, freeTable } from "@/app/actions/admin";
import { MenuItem } from "@/app/actions/menu";
import { Calendar, UtensilsCrossed } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminClientProps {
  tables: Table[];
  reservations: Reservation[];
  menuItems: MenuItem[];
}

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Reservation;
  old?: { id: string };
}

export default function AdminClient({ tables, reservations, menuItems }: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<"booking" | "stoplist">("booking");
  const [localReservations, setLocalReservations] = useState(reservations);
  const router = useRouter();

  const handleRealtimeUpdate = useCallback((payload: RealtimePayload) => {
    console.log('[ADMIN] Realtime update:', payload.eventType, payload);
    
    if (payload.eventType === 'INSERT' && payload.new) {
      const exists = localReservations.some(r => r.id === payload.new!.id);
      if (!exists) {
        setLocalReservations(prev => [...prev, payload.new as Reservation]);
      }
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      setLocalReservations(prev => 
        prev.map(r => r.id === payload.new!.id ? payload.new as Reservation : r)
      );
    } else if (payload.eventType === 'DELETE' && payload.old) {
      setLocalReservations(prev => 
        prev.filter(r => r.id !== payload.old!.id)
      );
    }
  }, [localReservations]);

  const handleFreeTable = useCallback(async (reservationId: string) => {
    console.log('[ADMIN] Optimistic update: freeing table', reservationId);
    
    setLocalReservations(prev => 
      prev.filter(r => r.id !== reservationId)
    );
    
    await freeTable(reservationId);
    router.refresh();
  }, [router]);

  const handleSeatGuest = useCallback(async (reservationId: string, tableId: string) => {
    console.log('[ADMIN] Optimistic update: seating guest', reservationId, 'at table', tableId);
    
    setLocalReservations(prev =>
      prev.map(r => r.id === reservationId ? { ...r, status: 'seated' as const, table_id: tableId } : r)
    );
    
    const { seatGuest } = await import("@/app/actions/admin");
    await seatGuest(reservationId, tableId);
    router.refresh();
  }, [router]);

  const tabs = [
    { id: "booking" as const, label: "Бронирование", icon: Calendar },
    { id: "stoplist" as const, label: "Стоп-лист", icon: UtensilsCrossed },
  ];

  return (
    <>
      <RealtimeListener onRealtimeUpdate={handleRealtimeUpdate} />
      
      <div className="mb-6">
        <div className="flex gap-2 p-1.5 bg-[#2C2C2E] rounded-2xl inline-flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200
                  ${isActive 
                    ? "bg-[#9ffb00] text-black shadow-lg shadow-[#9ffb00]/20" 
                    : "text-[#98989D] hover:text-white hover:bg-[#3A3A3C]"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "booking" && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Шахматка столов</h2>
              <p className="text-gray-400">Нажмите на занятый стол — управление. На свободный — создать бронь вручную</p>
            </div>
            
            <Chessboard 
              tables={tables} 
              reservations={localReservations}
              onFreeTable={handleFreeTable}
              onSeatGuest={handleSeatGuest}
              onReservationCreated={() => router.refresh()}
            />
          </div>

          <div className="w-full lg:w-96">
            <UpcomingBookings 
              reservations={localReservations} 
              tables={tables}
              onSeatGuest={handleSeatGuest}
            />
          </div>
        </div>
      )}

      {activeTab === "stoplist" && (
        <div className="max-w-2xl">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Стоп-лист меню</h2>
            <p className="text-gray-400">Управление доступностью позиций</p>
          </div>
          <StopList items={menuItems} />
        </div>
      )}
    </>
  );
}
