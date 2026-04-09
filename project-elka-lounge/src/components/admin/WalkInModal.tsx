"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Users, User, Phone, Clock, Zap, AlertTriangle } from "lucide-react";
import { createWalkIn, WalkInTable, Table, Reservation } from "@/app/actions/admin";
import { formatTimeLocal, getCurrentTimeInLocalTZ, getMinutesFromMidnightLocalTZ } from "@/lib/datetime";
import { toast } from "sonner";

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tables: Table[];
  reservations: Reservation[];
}

const DEFAULT_DURATION = 180;

function getAvailableTablesClient(reservations: Reservation[], tables: Table[]): WalkInTable[] {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const seatedTableIds = new Set(
    reservations
      .filter(r => r.status === "seated")
      .map(r => r.table_id)
      .filter(Boolean)
  );

  const activeByTable: Record<string, Reservation> = {};
  for (const res of reservations) {
    if (res.status === "seated" || res.status === "confirmed" || res.status === "waitlist") {
      const arrivalMins = getMinutesFromMidnightLocalTZ(res.arrival_time);
      if (arrivalMins === null) continue;
      const endMins = arrivalMins + res.expected_duration_minutes;
      if (arrivalMins <= nowMinutes && endMins > nowMinutes) {
        activeByTable[res.table_id ?? ""] = res;
      }
    }
  }

  const result: WalkInTable[] = [];
  for (const table of tables) {
    if (!table.is_active) continue;
    if (seatedTableIds.has(table.id)) continue;
    if (activeByTable[table.id]) continue;

    const todayRes = reservations
      .filter(r => r.table_id === table.id && r.status !== "cancelled" && r.status !== "completed")
      .sort((a, b) => new Date(a.arrival_time).getTime() - new Date(b.arrival_time).getTime());

    const nextRes = todayRes.find(r => {
      const arrivalMins = getMinutesFromMidnightLocalTZ(r.arrival_time);
      return arrivalMins !== null && arrivalMins > nowMinutes;
    });

    let maxDuration: number | null = null;
    let nextTime: string | null = null;

    if (nextRes) {
      const nextArrivalMins = getMinutesFromMidnightLocalTZ(nextRes.arrival_time);
      if (nextArrivalMins !== null) {
        maxDuration = nextArrivalMins - nowMinutes;
        nextTime = nextRes.arrival_time;
      }
    }

    result.push({
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      features: table.features,
      maxDurationMinutes: maxDuration,
      nextReservationTime: nextTime,
    });
  }
  return result;
}

function getZoneLabel(number: number): string {
  const cityTables = [1, 2, 3, 4, 5, 6, 7, 11.5];
  const ps5Tables = [10, 12];
  if (cityTables.includes(number)) return "CITY";
  if (ps5Tables.includes(number)) return "PS5";
  return "Standard";
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

export default function WalkInModal({ isOpen, onClose, onSuccess, tables, reservations }: WalkInModalProps) {
  const [selectedTable, setSelectedTable] = useState<WalkInTable | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestsCount, setGuestsCount] = useState(2);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const availableTables = useMemo(() => {
    return getAvailableTablesClient(reservations, tables);
  }, [reservations, tables]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedTable(null);
    setGuestName("");
    setGuestPhone("");
    setGuestsCount(2);
    setDuration(DEFAULT_DURATION);
    setIsSubmitting(false);

    const updateTime = () => {
      const { hours, minutes } = getCurrentTimeInLocalTZ();
      setCurrentTime(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isOpen, availableTables]);

  useEffect(() => {
    if (selectedTable && selectedTable.maxDurationMinutes !== null) {
      setDuration((d) => Math.min(d, selectedTable.maxDurationMinutes!));
    }
  }, [selectedTable]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedTable) {
      toast.error("Выберите стол");
      return;
    }
    if (!guestName.trim()) {
      toast.error("Введите имя гостя");
      return;
    }
    if (guestsCount < 1) {
      toast.error("Укажите количество гостей");
      return;
    }
    if (guestsCount > selectedTable.capacity) {
      toast.error(`Вместимость стола — ${selectedTable.capacity} гостей`);
      return;
    }
    if (duration < 30) {
      toast.error("Минимум 30 минут");
      return;
    }

    setIsSubmitting(true);
    const result = await createWalkIn({
      tableId: selectedTable.id,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestsCount,
      durationMinutes: duration,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      onSuccess();
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  const durationOptions = selectedTable?.maxDurationMinutes !== null && selectedTable?.maxDurationMinutes !== undefined
    ? [30, 60, 90, 120, selectedTable.maxDurationMinutes]
        .filter((v, i, a) => a.indexOf(v) === i && v <= selectedTable.maxDurationMinutes!)
        .sort((a, b) => a - b)
    : [30, 60, 90, 120, 180, 240];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#3A3A3C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9ffb00]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#9ffb00]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Быстрая посадка</h2>
              <p className="text-sm text-[#98989D]">{currentTime} — Новосибирск (UTC+7)</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-[#98989D]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <p className="text-sm font-medium text-[#98989D] mb-3 uppercase tracking-wide">Свободные столы</p>
            {availableTables.length === 0 ? (
              <div className="bg-[#2C2C2E] rounded-xl p-4 text-center text-[#98989D]">
                Все столы заняты
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableTables.map((table) => {
                  const isSelected = selectedTable?.id === table.id;
                  const hasLimit = table.maxDurationMinutes !== null;
                  return (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table)}
                      className={`
                        relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                        ${isSelected
                          ? "border-[#9ffb00] bg-[#9ffb00]/10 text-white"
                          : "border-[#3A3A3C] bg-[#2C2C2E] text-[#98989D] hover:border-[#98989D]"
                        }
                      `}
                    >
                      <span className={`text-lg font-bold ${isSelected ? "text-[#9ffb00]" : "text-white"}`}>
                        {table.number}
                      </span>
                      <span className="text-[10px] mt-0.5">{getZoneLabel(table.number)}</span>
                      <span className="text-[10px] text-[#98989D]">{table.capacity}🪑</span>
                      {hasLimit && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">!</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedTable && (
            <>
              {selectedTable.maxDurationMinutes !== null && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-orange-300">
                    Стол {selectedTable.number} забронирован на {formatTimeLocal(selectedTable.nextReservationTime)}.
                    Максимум: <strong>{formatDuration(selectedTable.maxDurationMinutes)}</strong>
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#98989D] mb-1.5">
                      <User className="w-3.5 h-3.5 inline mr-1" />
                      Имя гостя *
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Как представиться"
                      className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#98989D]/50 focus:border-[#9ffb00] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#98989D] mb-1.5">
                      <Phone className="w-3.5 h-3.5 inline mr-1" />
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="Необязательно"
                      className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#98989D]/50 focus:border-[#9ffb00] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#98989D] mb-1.5">
                    <Users className="w-3.5 h-3.5 inline mr-1" />
                    Количество гостей
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                      className="w-10 h-10 rounded-xl bg-[#2C2C2E] border border-[#3A3A3C] flex items-center justify-center text-white hover:bg-[#3A3A3C] transition-colors"
                    >
                      −
                    </button>
                    <span className="text-2xl font-bold text-white w-8 text-center">{guestsCount}</span>
                    <button
                      onClick={() => setGuestsCount(Math.min(selectedTable.capacity, guestsCount + 1))}
                      className="w-10 h-10 rounded-xl bg-[#2C2C2E] border border-[#3A3A3C] flex items-center justify-center text-white hover:bg-[#3A3A3C] transition-colors"
                    >
                      +
                    </button>
                    <span className="text-sm text-[#98989D] ml-1">/ {selectedTable.capacity} max</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#98989D] mb-1.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    Длительность
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {durationOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setDuration(opt)}
                        disabled={selectedTable.maxDurationMinutes !== null && opt > selectedTable.maxDurationMinutes}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                          ${duration === opt
                            ? "bg-[#9ffb00] text-black"
                            : selectedTable.maxDurationMinutes !== null && opt > selectedTable.maxDurationMinutes
                            ? "bg-[#2C2C2E] text-[#98989D]/30 cursor-not-allowed"
                            : "bg-[#2C2C2E] border border-[#3A3A3C] text-[#98989D] hover:border-[#98989D]"
                          }
                        `}
                      >
                        {formatDuration(opt)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-[#3A3A3C]">
          <button
            onClick={handleSubmit}
            disabled={!selectedTable || !guestName.trim() || isSubmitting}
            className={`
              w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2
              ${selectedTable && guestName.trim() && !isSubmitting
                ? "bg-[#9ffb00] text-black hover:bg-[#8BDC00] shadow-lg shadow-[#9ffb00]/20"
                : "bg-[#2C2C2E] text-[#98989D] cursor-not-allowed"
              }
            `}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Посадить{selectedTable ? ` за стол ${selectedTable.number}` : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
