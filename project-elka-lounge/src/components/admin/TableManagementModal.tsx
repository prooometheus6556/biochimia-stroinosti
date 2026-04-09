"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, AlertTriangle, Check, Plus, Minus, CheckCircle2, XCircle, LogOut, Calendar, Clock } from "lucide-react";
import { createAdminReservation, updateReservationStatus } from "@/app/actions/admin";
import { toDisplayNumber } from "@/lib/tableDisplay";
import { formatTimeLocal } from "@/lib/datetime";
import { toast } from "sonner";
import { Table, Reservation } from "@/app/actions/admin";

interface TableManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tables: Table[];
  reservations: Reservation[];
  initialTableId: string;
}

const TZ = "Asia/Novosibirsk";

function getLocalHoursMinutes(isoString: string | null | undefined): { hours: number; minutes: number } | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    const formatted = d.toLocaleString("en-GB", { timeZone: TZ });
    const [, timePart] = formatted.split(" ");
    const [hours, minutes] = timePart.split(":").map(Number);
    return { hours, minutes };
  } catch {
    return null;
  }
}

function getDayStartLocal(): { date: string; time: string } {
  const now = new Date();
  const date = now.toLocaleDateString("en-CA", { timeZone: TZ });
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}ч`;
  return `${h}ч ${m}м`;
}

function getTableReservationsForDay(
  tableId: string,
  reservations: Reservation[],
  targetDate: string
): Reservation[] {
  return reservations
    .filter((r) => {
      if (r.table_id !== tableId) return false;
      const rDate = new Date(r.arrival_time).toLocaleDateString("en-CA", { timeZone: TZ });
      return rDate === targetDate;
    })
    .filter((r) => r.status !== "completed" && r.status !== "cancelled");
}

function getCurrentSeatedReservation(
  tableId: string,
  reservations: Reservation[]
): Reservation | null {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  
  return reservations
    .filter((r) => {
      if (r.table_id !== tableId) return false;
      if (r.status !== "seated") return false;
      const time = getLocalHoursMinutes(r.arrival_time);
      if (!time) return false;
      const resMinutes = time.hours * 60 + time.minutes;
      return resMinutes <= nowMinutes && nowMinutes < resMinutes + r.expected_duration_minutes;
    })
    .sort((a, b) => {
      const aTime = getLocalHoursMinutes(a.arrival_time);
      const bTime = getLocalHoursMinutes(b.arrival_time);
      if (!aTime || !bTime) return 0;
      return aTime.hours * 60 + aTime.minutes - (bTime.hours * 60 + bTime.minutes);
    })[0] ?? null;
}

function isBlockReservation(r: Reservation): boolean {
  return (r.guest?.name ?? "").toUpperCase().startsWith("БЛОК:");
}

const SMALL_TABLES = ["2", "11", "11.5"];
const SMALL_CAPACITY = 2;

function isSmallTable(table: Table): boolean {
  return SMALL_TABLES.includes(String(table.number)) || table.capacity === SMALL_CAPACITY;
}

function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

interface TimelineSlot {
  hour: number;
  label: string;
  reservation: Reservation | null;
  isPast: boolean;
  isNow: boolean;
}

const OPEN_HOUR = 12;
const CLOSE_HOUR = 26;

function buildTimeline(reservations: Reservation[]): TimelineSlot[] {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const slots: TimelineSlot[] = [];

  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    const displayH = h >= 24 ? h - 24 : h;
    const label = `${String(displayH).padStart(2, "0")}:00`;
    const slotMinutes = (h >= 24 ? h - 24 : h) * 60;
    const isPast = slotMinutes < nowMinutes;
    const isNow = !isPast && slotMinutes <= nowMinutes && nowMinutes < slotMinutes + 60;

    let matchedReservation: Reservation | null = null;
    for (const res of reservations) {
      const time = getLocalHoursMinutes(res.arrival_time);
      if (!time) continue;
      const resMinutes = time.hours * 60 + time.minutes;
      const endMinutes = resMinutes + res.expected_duration_minutes;
      if (resMinutes <= slotMinutes && slotMinutes < endMinutes) {
        matchedReservation = res;
        break;
      }
    }

    slots.push({ hour: h, label, reservation: matchedReservation, isPast, isNow });
  }

  return slots;
}

const BLOCK_SUGGESTIONS = [
  "БЛОК: Сдвиг столов",
  "БЛОК: Тех. перерыв",
  "БЛОК: Корпоратив",
];

export default function TableManagementModal({
  isOpen,
  onClose,
  onSuccess,
  tables,
  reservations,
  initialTableId,
}: TableManagementModalProps) {
  const todayDefaults = useMemo(() => getDayStartLocal(), []);

  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(todayDefaults.date);
  const [time, setTime] = useState(todayDefaults.time);
  const [guests, setGuests] = useState(6);
  const [durationHours, setDurationHours] = useState(3);
  const [isBlock, setIsBlock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialTable = tables.find((t) => t.id === initialTableId);

  const isAnySmallTableSelected = useMemo(() => {
    return selectedTableIds.some((id) => {
      const table = tables.find((t) => t.id === id);
      return table && isSmallTable(table);
    });
  }, [selectedTableIds, tables]);

  const maxGuests = isAnySmallTableSelected ? SMALL_CAPACITY : 20;

  const targetDate = date;

  const tableReservations = useMemo(() => {
    if (!targetDate) return [];
    return getTableReservationsForDay(
      selectedTableIds[0] ?? initialTableId,
      reservations,
      targetDate
    );
  }, [selectedTableIds, initialTableId, reservations, targetDate]);

  const timeline = useMemo(() => buildTimeline(tableReservations), [tableReservations]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTableIds([initialTableId]);
      setDate(todayDefaults.date);
      setTime(todayDefaults.time);
      setName("");
      setPhone("");
      const table = tables.find((t) => t.id === initialTableId);
      setGuests(table && isSmallTable(table) ? 2 : 6);
      setDurationHours(3);
      setIsBlock(false);
    }
  }, [isOpen, initialTableId, todayDefaults, tables]);

  const toggleTable = (tableId: string) => {
    setSelectedTableIds((prev) =>
      prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
    );
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (!selectedTableIds.length) {
      toast.error("Выберите хотя бы один стол", { position: "top-center" });
      return;
    }
    if (!date || !time) {
      toast.error("Пожалуйста, выберите время в таймлайне", { position: "top-center" });
      return;
    }
    if (!name.trim()) {
      toast.error("Введите имя гостя", { position: "top-center" });
      return;
    }
    if (isAnySmallTableSelected && guests > SMALL_CAPACITY) {
      toast.error(`Малый стол: максимум ${SMALL_CAPACITY} гостя`, { position: "top-center" });
      return;
    }

    setIsSubmitting(true);

    const finalName = isBlock && !name.trim().toUpperCase().startsWith("БЛОК:")
      ? `БЛОК: ${name.trim()}`
      : name.trim();

    const phoneFormatted =
      phone.replace(/\D/g, "").length === 10 ? `+7 ${phone}` : phone;

    const result = await createAdminReservation({
      tableIds: selectedTableIds,
      name: finalName,
      phone: phoneFormatted,
      date,
      time,
      guests,
      durationMinutes: durationHours * 60,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message, { position: "top-center" });
      onSuccess();
      onClose();
    } else {
      toast.error(result.message, { position: "top-center", duration: 5000 });
    }
  }, [isSubmitting, selectedTableIds, name, phone, date, time, guests, durationHours, isBlock, isAnySmallTableSelected, onSuccess, onClose]);

  const handleGuestLeft = useCallback(async () => {
    if (!initialTableId) return;
    const seated = getCurrentSeatedReservation(initialTableId, reservations);
    if (!seated) return;
    
    setIsSubmitting(true);
    try {
      const result = await updateReservationStatus(seated.id, "completed", true);
      if (result.success) {
        toast.success("Гость ушёл. Стол освобождён", { position: "top-center" });
        onSuccess();
        onClose();
      } else {
        toast.error(result.message, { position: "top-center", duration: 5000 });
      }
    } catch {
      toast.error("Ошибка при освобождении стола", { position: "top-center" });
    } finally {
      setIsSubmitting(false);
    }
  }, [initialTableId, reservations, onSuccess, onClose]);

  if (!isOpen) return null;

  const currentSeatedReservation = initialTableId ? getCurrentSeatedReservation(initialTableId, reservations) : null;

  const selectedTimeMinutes =
    parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
  const isCurrentlyFree =
    !tableReservations.some(
      (r) => {
        const t = getLocalHoursMinutes(r.arrival_time);
        if (!t) return false;
        const rMin = t.hours * 60 + t.minutes;
        return rMin <= selectedTimeMinutes && rMin + r.expected_duration_minutes > selectedTimeMinutes;
      }
    );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1C1C1E] border border-white/10 rounded-2xl p-5 w-full max-w-md shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#98989D] hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4 flex-shrink-0">
          <div className="w-14 h-14 bg-[#9ffb00]/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-3xl font-black text-[#9ffb00]">
              {initialTable?.number ?? "?"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Управление столом {initialTable?.number}
          </h2>
          <p className="text-[#98989D] text-sm mt-0.5">Нажмите на время в таймлайне</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mr-1 min-h-0">
          {/* Block A: Current status */}
          <div className="bg-[#2C2C2E] rounded-xl p-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[#98989D] text-sm">Текущий статус</span>
              {currentSeatedReservation ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Гость за столом
                </div>
              ) : (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isCurrentlyFree
                      ? "bg-green-500/20 text-green-400"
                      : "bg-orange-500/20 text-orange-400"
                  }`}
                >
                  {isCurrentlyFree ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {isCurrentlyFree ? "Свободен сейчас" : "Занят сейчас"}
                </div>
              )}
            </div>
            {currentSeatedReservation && (
              <div className="mt-3 pt-3 border-t border-[#3A3A3C]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {currentSeatedReservation.guest?.name || "Гость"}
                    </p>
                    {currentSeatedReservation.guest?.phone && (
                      <p className="text-[#98989D] text-xs">{currentSeatedReservation.guest.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#98989D] mb-3">
                  <span>За столом с {formatTimeLocal(currentSeatedReservation.arrival_time)}</span>
                  <span>{formatDuration(currentSeatedReservation.expected_duration_minutes)}</span>
                </div>
                <button
                  onClick={handleGuestLeft}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {isSubmitting ? "Освобождаю..." : "Гость ушёл (Освободить стол)"}
                </button>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-[#2C2C2E] rounded-xl p-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#98989D] text-xs">Таймлайн на сегодня</span>
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1 text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full" /> своб.
                </span>
                <span className="flex items-center gap-1 text-orange-400">
                  <span className="w-2 h-2 bg-orange-500 rounded-full" /> занят
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 max-h-36 overflow-y-auto">
              {timeline.map((slot) => {
                const isSelected =
                  parseInt(slot.label.split(":")[0]) === parseInt(time.split(":")[0]) &&
                  !slot.isPast;
                const isConflict = (() => {
                  if (!slot.reservation) return false;
                  const t = getLocalHoursMinutes(slot.reservation.arrival_time);
                  if (!t) return false;
                  return t.hours * 60 + t.minutes === slot.hour * 60;
                })();
                const isBlock = slot.reservation && isBlockReservation(slot.reservation!);
                return (
                  <button
                    key={slot.hour}
                    onClick={() => !slot.isPast && setTime(`${String(slot.hour).padStart(2, "0")}:00`)}
                    disabled={slot.isPast}
                    className={`
                      relative py-1.5 px-1 rounded-lg text-center text-xs font-medium transition-all
                      ${slot.isPast ? "opacity-25 cursor-default" : "cursor-pointer hover:scale-105"}
                      ${isSelected && !slot.isPast ? "ring-2 ring-[#9ffb00] ring-offset-1 ring-offset-[#2C2C2E]" : ""}
                      ${slot.reservation && !isConflict ? "opacity-50" : ""}
                      ${
                        slot.reservation && isConflict
                          ? isBlock
                            ? "bg-orange-500/50 text-orange-200 border border-orange-400/40"
                            : "bg-orange-500/40 text-orange-200 border border-orange-500/40"
                          : !slot.isPast && !slot.reservation
                          ? "bg-[#3A3A3C] text-[#98989D] hover:bg-[#4A4A4C]"
                          : ""
                      }
                    `}
                    title={
                      slot.reservation
                        ? `${slot.reservation.guest?.name ?? "?"} (${formatDuration(slot.reservation.expected_duration_minutes)})`
                        : slot.label
                    }
                  >
                    <div className="font-bold">{slot.label}</div>
                    {isConflict && (
                      <div className="text-[9px] truncate opacity-80">
                        {slot.reservation?.guest?.name?.slice(0, 6) ?? "занят"}
                      </div>
                    )}
                    {slot.isNow && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#9ffb00] rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Block B: Quick booking form */}
          <div className="space-y-3">
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setIsBlock(false)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                  !isBlock
                    ? "bg-[#9ffb00] text-black"
                    : "bg-[#3A3A3C] text-[#98989D]"
                }`}
              >
                Гость
              </button>
              <button
                onClick={() => setIsBlock(true)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                  isBlock
                    ? "bg-orange-500 text-white"
                    : "bg-[#3A3A3C] text-[#98989D]"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Блок
              </button>
            </div>

            {isBlock && (
              <div className="flex flex-wrap gap-1">
                {BLOCK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setName(s)}
                    className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[#98989D] text-xs">
                Имя гостя {!isBlock && <span className="text-red-400">*</span>}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isBlock ? "БЛОК: Название..." : "Иван"}
                className="w-full h-11 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-base outline-none focus:border-[#9ffb00] transition-all box-border"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#98989D] text-xs">Телефон</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(999) 123-45-67"
                className="w-full h-11 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-base outline-none focus:border-[#9ffb00] transition-all box-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#98989D] text-xs">Дата</label>
                <div className="h-11 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#636366]" />
                  <span className="text-white font-medium">{formatDateForDisplay(date)}</span>
                </div>
                <p className="text-[10px] text-[#636366] mt-1">Выберите в таймлайне</p>
              </div>
              <div className="space-y-1">
                <label className="text-[#98989D] text-xs">Время</label>
                <div className="h-11 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#636366]" />
                  <span className="text-white font-mono font-medium">{time || "--:--"}</span>
                </div>
                <p className="text-[10px] text-[#636366] mt-1">Выберите в таймлайне</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#98989D] text-xs">
                  Гостей
                  {isAnySmallTableSelected && (
                    <span className="text-orange-400 ml-1">(малый стол)</span>
                  )}
                </label>
                <div className="flex items-center bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl h-11">
                  <button
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    disabled={guests <= 1}
                    className="px-3 text-[#98989D] hover:text-white transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center text-white font-medium">{guests}</span>
                  <button
                    onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                    disabled={guests >= maxGuests}
                    className="px-3 text-[#98989D] hover:text-white transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {isAnySmallTableSelected && (
                  <p className="text-[10px] text-orange-400 mt-1">Максимум {maxGuests} гостя</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[#98989D] text-xs">Длительность</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value))}
                  className="w-full h-11 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-sm outline-none focus:border-[#9ffb00] transition-all box-border appearance-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <option key={h} value={h}>
                      {h} {h === 1 ? "час" : h < 5 ? "часа" : "часов"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table selector */}
            <div className="space-y-2">
              <label className="text-[#98989D] text-xs">
                Столы ({selectedTableIds.length} выбрано)
                {isAnySmallTableSelected && (
                  <span className="text-orange-400 ml-1">(до 2 гостей)</span>
                )}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {tables.map((table) => {
                  const isSelected = selectedTableIds.includes(table.id);
                  const isSmall = isSmallTable(table);
                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => toggleTable(table.id)}
                      className={`
                        relative py-2 px-1 rounded-xl border-2 text-center text-sm font-bold transition-all
                        ${isSelected
                          ? "border-[#9ffb00] bg-[#9ffb00]/20 text-[#9ffb00]"
                          : isSmall
                          ? "border-orange-500/30 bg-[#2C2C2E] text-orange-400/70 hover:border-orange-500/50"
                          : "border-[#3A3A3C] bg-[#2C2C2E] text-[#98989D] hover:border-[#4A4A4C]"
                        }
                      `}
                    >
                      {toDisplayNumber(table.number)}
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#9ffb00] rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-black" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 mt-4 flex-shrink-0 pt-3 border-t border-[#3A3A3C]">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedTableIds.length || !name.trim()}
            className={`
              flex-1 py-3 px-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2
              ${!isSubmitting && selectedTableIds.length && name.trim()
                ? isBlock
                  ? "bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                  : "bg-[#9ffb00] hover:bg-[#8bdc00] text-black shadow-[0_0_20px_rgba(159,251,0,0.3)]"
                : "bg-[#3A3A3C] text-[#636366] cursor-not-allowed"
              }
            `}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Бронируем...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                {isBlock ? "Заблокировать" : "Забронировать"}
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-[#3A3A3C] hover:bg-[#4A4A4C] text-white rounded-xl transition-all"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
