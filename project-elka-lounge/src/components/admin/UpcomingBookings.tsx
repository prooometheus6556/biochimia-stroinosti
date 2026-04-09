"use client";

import { useState, useEffect } from "react";
import { Users, Clock, MapPin, AlertTriangle, X, UserX } from "lucide-react";
import { Reservation, Table, updateReservationStatus } from "@/app/actions/admin";
import { toDisplayNumber } from "@/lib/tableDisplay";
import { formatTimeLocal, parseToLocalDateTime, getHoursDiff } from "@/lib/datetime";

function isBlockReservation(r: Reservation): boolean {
  const name = r.guest?.name ?? "";
  return name.toUpperCase().startsWith("БЛОК:");
}

interface UpcomingBookingsProps {
  reservations: Reservation[];
  tables: Table[];
  onSeatGuest?: (reservationId: string, tableId: string) => void;
  onReservationChange?: () => void;
}

const HIDE_AFTER_HOURS = 3;

export default function UpcomingBookings({ reservations, tables, onSeatGuest, onReservationChange }: UpcomingBookingsProps) {
  const [seatingReservation, setSeatingReservation] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancellingReservation, setCancellingReservation] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
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

  const seatedTableIds = reservations
    .filter((r) => r.status === "seated")
    .map((r) => r.table_id)
    .filter(Boolean);

  const freeTables = tables.filter((t) => !seatedTableIds.includes(t.id));

  const getTimeFromDate = (dateString: string | null | undefined) => {
    return formatTimeLocal(dateString);
  };

  const getTableName = (tableId: string | null, tables: Table[]) => {
    if (!tableId) return null;
    const table = tables.find((t) => t.id === tableId);
    return table ? `Стол ${toDisplayNumber(table.number)}` : null;
  };

  useEffect(() => {
    console.log("[UpcomingBookings] Received reservations:", JSON.stringify(reservations, null, 2));
    console.log("[UpcomingBookings] Active reservations:", JSON.stringify(activeReservations.map(r => ({
      id: r.id,
      arrival_time: r.arrival_time,
      status: r.status,
      guest: r.guest?.name
    })), null, 2));
  }, [reservations, activeReservations]);

  const handleSeat = async () => {
    if (!selectedTable || !seatingReservation || !onSeatGuest) return;

    setMessage(null);
    setIsProcessing(true);

    const reservationId = seatingReservation;
    const tableId = selectedTable;
    
    setSeatingReservation(null);
    setSelectedTable("");

    try {
      await onSeatGuest(reservationId, tableId);
      setMessage({ type: "success", text: "Гость успешно посажен!" });
      onReservationChange?.();
    } catch {
      setMessage({ type: "error", text: "Ошибка при посадке гостя" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async (reservationId: string) => {
    setMessage(null);
    setCancellingReservation(reservationId);

    try {
      const result = await updateReservationStatus(reservationId, "cancelled", true);
      if (result.success) {
        setMessage({ type: "success", text: "Бронь отменена" });
        onReservationChange?.();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка при отмене брони" });
    } finally {
      setCancellingReservation(null);
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

      {message && (
        <div className={`mx-4 mt-4 p-3 rounded-xl text-sm ${
          message.type === "success" 
            ? "bg-green-900/30 border border-green-500/30 text-green-400" 
            : "bg-red-900/30 border border-red-500/30 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

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

              return (
                <div key={item.id} className={`p-4 hover:bg-[#3A3A3C]/30 transition-colors ${isProcessing ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-lg ${isBlocked ? "text-orange-400" : "text-[#9ffb00]"}`}>
                          {getTimeFromDate(item.arrival_time)}
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

                  {!isBlocked && (seatingReservation === item.id ? (
                    <div className="space-y-2">
                      <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="w-full h-12 bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl text-white px-4 appearance-none cursor-pointer"
                      >
                        <option value="">Выберите стол</option>
                        {freeTables.map((table) => (
                          <option key={table.id} value={table.id}>
                            Стол {toDisplayNumber(table.number)}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSeat}
                          disabled={!selectedTable || isProcessing}
                          className="flex-1 py-3 px-4 bg-[#9ffb00] hover:bg-[#8bdc00] text-black font-semibold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          {isProcessing ? "Посадка..." : "Подтвердить"}
                        </button>
                        <button
                          onClick={() => {
                            setSeatingReservation(null);
                            setSelectedTable("");
                          }}
                          className="py-3 px-4 bg-[#3A3A3C] hover:bg-[#4A4A4C] text-white rounded-xl transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => setSeatingReservation(item.id)}
                        disabled={isProcessing || cancellingReservation === item.id || freeTables.length === 0}
                        className="w-full py-3 px-4 bg-[#9ffb00] hover:bg-[#8bdc00] text-black font-semibold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {freeTables.length === 0 ? "Нет свободных столов" : "Посадить гостя"}
                      </button>
                      <button
                        onClick={() => handleCancel(item.id)}
                        disabled={isProcessing || cancellingReservation === item.id}
                        className="w-full py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <UserX className="w-4 h-4" />
                        {cancellingReservation === item.id ? "Отмена..." : "Неявка / Отмена"}
                      </button>
                    </div>
                  ))}

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
