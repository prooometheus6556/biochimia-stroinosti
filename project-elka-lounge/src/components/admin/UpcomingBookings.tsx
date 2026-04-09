"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Clock, MapPin, AlertTriangle, UserX } from "lucide-react";
import { Reservation, Table, updateReservationStatus } from "@/app/actions/admin";
import { toDisplayNumber } from "@/lib/tableDisplay";
import { formatTimeLocal, parseToLocalDateTime, getHoursDiff } from "@/lib/datetime";
import { toast } from "sonner";

function isBlockReservation(r: Reservation): boolean {
  const name = r.guest?.name ?? "";
  return name.toUpperCase().startsWith("БЛОК:");
}

interface UpcomingBookingsProps {
  reservations: Reservation[];
  tables: Table[];
  onReservationChange?: () => void;
}

const HIDE_AFTER_HOURS = 3;

export default function UpcomingBookings({ reservations, tables, onReservationChange }: UpcomingBookingsProps) {
  const router = useRouter();
  const [seatingReservationId, setSeatingReservationId] = useState<string | null>(null);
  const [cancellingReservationId, setCancellingReservationId] = useState<string | null>(null);
  const [, forceRender] = useState(0);

  const activeReservations = reservations
    .filter((r) => {
      if (r.status !== "waitlist" && r.status !== "confirmed") return false;
      const hoursDiff = getHoursDiff(r.arrival_time);
      if (hoursDiff > HIDE_AFTER_HOURS) return false;
      return true;
    })
    .sort((a, b) => {
      const aLocal = parseToLocalDateTime(a.arrival_time)?.getTime() ?? Infinity;
      const bLocal = parseToLocalDateTime(b.arrival_time)?.getTime() ?? Infinity;
      return aLocal - bLocal;
    });

  useEffect(() => {
    const interval = setInterval(() => forceRender((n) => n + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const getTableName = (tableId: string | null, tables: Table[]) => {
    if (!tableId) return null;
    const table = tables.find((t) => t.id === tableId);
    return table ? `Стол ${toDisplayNumber(table.number)}` : null;
  };

  const handleSeatGuest = async (reservation: Reservation) => {
    if (!reservation.table_id) {
      toast.error("У брони нет номера стола");
      return;
    }

    setSeatingReservationId(reservation.id);

    try {
      const result = await updateReservationStatus(reservation.id, "seated");
      if (result.success) {
        toast.success("Гость посажен за стол");
        onReservationChange?.();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Ошибка при посадке гостя");
    } finally {
      setSeatingReservationId(null);
    }
  };

  const handleCancel = async (reservationId: string) => {
    setCancellingReservationId(reservationId);

    try {
      const result = await updateReservationStatus(reservationId, "cancelled", true);
      if (result.success) {
        toast.success("Бронь отменена");
        onReservationChange?.();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Ошибка при отмене брони");
    } finally {
      setCancellingReservationId(null);
    }
  };

  return (
    <div className="bg-[#2C2C2E] rounded-3xl border border-[#3A3A3C] overflow-hidden">
      <div className="p-6 border-b border-[#3A3A3C]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#9ffb00]">Ближайшие брони</h3>
          <span className="px-3 py-1 bg-[#9ffb00]/20 text-[#9ffb00] rounded-full text-sm font-medium">
            {activeReservations.length}
          </span>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {activeReservations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#3A3A3C] rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-[#98989D]" />
            </div>
            <p className="text-[#98989D]">Нет предстоящих броней</p>
            <p className="text-sm text-[#636366] mt-1">Новые брони появятся здесь</p>
          </div>
        ) : (
          <div className="divide-y divide-[#3A3A3C]">
            {activeReservations.map((item) => {
              const tableName = getTableName(item.table_id, tables);
              const isBlocked = isBlockReservation(item);
              const isSeating = seatingReservationId === item.id;
              const isCancelling = cancellingReservationId === item.id;
              const isProcessing = isSeating || isCancelling;

              return (
                <div key={item.id} className={`p-4 hover:bg-[#3A3A3C]/30 transition-colors ${isProcessing ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-lg ${isBlocked ? "text-orange-400" : "text-[#9ffb00]"}`}>
                          {formatTimeLocal(item.arrival_time)}
                        </span>
                        {isBlocked && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                            <AlertTriangle className="w-3 h-3" />Блок
                          </span>
                        )}
                        {!isBlocked && item.status === "confirmed" && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Подтверждена</span>
                        )}
                      </div>
                      <h4 className={`font-semibold text-lg truncate ${isBlocked ? "text-orange-400" : "text-white"}`}>
                        {item.guest?.name || "Гость"}
                      </h4>
                      {!isBlocked && (
                        <p className="text-[#98989D] text-sm">{item.guest?.phone || "Нет телефона"}</p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end gap-1 text-[#F5F5F7]">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {Math.floor(item.expected_duration_minutes / 60)}ч
                        </span>
                      </div>
                      {tableName && (
                        <div className={`flex items-center justify-end gap-1 ${isBlocked ? "text-orange-400" : "text-[#9ffb00]"}`}>
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm font-medium">{tableName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isBlocked && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSeatGuest(item)}
                        disabled={isProcessing}
                        className="w-full py-3 px-4 bg-[#9ffb00] hover:bg-[#8bdc00] text-black font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSeating ? (
                          <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Сажаем...
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4" />
                            Посадить гостя
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleCancel(item.id)}
                        disabled={isProcessing}
                        className="w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <UserX className="w-4 h-4" />
                        {isCancelling ? "Отмена..." : "Неявка / Отмена"}
                      </button>
                    </div>
                  )}

                  {isBlocked && (
                    <div className="py-3 px-4 bg-orange-500/20 border border-orange-500/30 rounded-xl text-center">
                      <span className="text-orange-400 text-sm font-medium">Блокировка стола</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
