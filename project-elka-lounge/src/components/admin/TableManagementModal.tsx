"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, AlertTriangle, Plus, Minus, LogOut, Calendar, Clock, User, Phone, Trash2 } from "lucide-react";
import { createAdminReservation, updateReservationStatus } from "@/app/actions/admin";
import { formatTimeLocal, getCurrentTimeInLocalTZ } from "@/lib/datetime";
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
  const { hours, minutes } = getCurrentTimeInLocalTZ();
  const time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return { date, time };
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}м`;
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
    .sort((a, b) => {
      const aTime = getLocalHoursMinutes(a.arrival_time);
      const bTime = getLocalHoursMinutes(b.arrival_time);
      if (!aTime || !bTime) return 0;
      return (aTime.hours * 60 + aTime.minutes) - (bTime.hours * 60 + bTime.minutes);
    });
}

function isBlockReservation(r: Reservation): boolean {
  return (r.guest?.name ?? "").toUpperCase().startsWith("БЛОК:");
}

const SMALL_TABLES = ["2", "11", "11.5"];
const SMALL_CAPACITY = 2;

function isSmallTable(table: Table): boolean {
  return SMALL_TABLES.includes(String(table.number)) || table.capacity === SMALL_CAPACITY;
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

  const [selectedTableId, setSelectedTableId] = useState<string>(initialTableId);
  const [date, setDate] = useState(todayDefaults.date);
  const [showForm, setShowForm] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(6);
  const [durationHours, setDurationHours] = useState(3);
  const [isBlock, setIsBlock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const selectedTable = useMemo(() => tables.find((t) => t.id === selectedTableId), [tables, selectedTableId]);
  const isCurrentTableSmall = selectedTable ? isSmallTable(selectedTable) : false;
  const maxGuests = isCurrentTableSmall ? SMALL_CAPACITY : 20;

  const tableReservations = useMemo(() => {
    if (!selectedTableId || !date) return [];
    return getTableReservationsForDay(selectedTableId, reservations, date);
  }, [selectedTableId, reservations, date]);

  const resetForm = useCallback(() => {
    setName("");
    setPhone("");
    setTime("");
    const table = tables.find((t) => t.id === selectedTableId);
    setGuests(table && isSmallTable(table) ? 2 : 6);
    setDurationHours(3);
    setIsBlock(false);
  }, [selectedTableId, tables]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTableId(initialTableId);
      setDate(todayDefaults.date);
      setShowForm(false);
      resetForm();
    }
  }, [isOpen, initialTableId, todayDefaults, resetForm]);

  const handleSeatGuest = async (reservation: Reservation) => {
    setProcessingId(reservation.id);
    try {
      const result = await updateReservationStatus(reservation.id, "seated");
      if (result.success) {
        toast.success("Гость посажен");
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Ошибка");
    } finally {
      setProcessingId(null);
    }
  };

  const handleFreeTable = async (reservation: Reservation) => {
    setProcessingId(reservation.id);
    try {
      const result = await updateReservationStatus(reservation.id, "completed", true);
      if (result.success) {
        toast.success("Стол освобождён");
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Ошибка");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (reservation: Reservation) => {
    setProcessingId(reservation.id);
    try {
      const result = await updateReservationStatus(reservation.id, "cancelled", true);
      if (result.success) {
        toast.success("Бронь отменена");
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Ошибка");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (!selectedTableId) {
      toast.error("Выберите стол");
      return;
    }
    if (!date || !time) {
      toast.error("Укажите дату и время");
      return;
    }
    if (!name.trim()) {
      toast.error("Введите имя гостя");
      return;
    }
    if (isCurrentTableSmall && guests > SMALL_CAPACITY) {
      toast.error(`Малый стол: максимум ${SMALL_CAPACITY} гостя`);
      return;
    }

    setIsSubmitting(true);

    const finalName = isBlock && !name.trim().toUpperCase().startsWith("БЛОК:")
      ? `БЛОК: ${name.trim()}`
      : name.trim();

    const phoneFormatted = phone.replace(/\D/g, "").length === 10 ? `+7 ${phone}` : phone;

    const result = await createAdminReservation({
      tableIds: [selectedTableId],
      name: finalName,
      phone: phoneFormatted,
      date,
      time,
      guests,
      durationMinutes: durationHours * 60,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      resetForm();
      setShowForm(false);
      onSuccess();
    } else {
      toast.error(result.message);
    }
  }, [isSubmitting, selectedTableId, date, time, name, phone, guests, durationHours, isBlock, isCurrentTableSmall, resetForm, onSuccess]);

  if (!isOpen) return null;

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
              {selectedTable?.number ?? "?"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Расписание стола {selectedTable?.number}
          </h2>
          {isCurrentTableSmall && (
            <span className="text-xs text-orange-400">Малый стол (до 2 гостей)</span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => {}}
              className="w-full h-10 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl px-3 flex items-center gap-2 hover:border-[#9ffb00]/50 transition-colors text-sm"
            >
              <Calendar className="w-4 h-4 text-[#636366]" />
              <span className="text-white">{formatDisplayDate(date)}</span>
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`h-10 px-4 rounded-xl font-semibold text-sm transition-all ${
              showForm
                ? "bg-[#9ffb00] text-black"
                : "bg-[#2C2C2E] text-white hover:bg-[#3A3A3C]"
            }`}
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Добавить
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mr-1 min-h-0">
          {showForm && (
            <div className="bg-[#2C2C2E] rounded-xl p-4 space-y-3 border border-[#9ffb00]/30">
              <h3 className="text-white font-semibold text-sm">Новая бронь</h3>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsBlock(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    !isBlock ? "bg-[#9ffb00] text-black" : "bg-[#3A3A3C] text-[#98989D]"
                  }`}
                >
                  Гость
                </button>
                <button
                  onClick={() => setIsBlock(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                    isBlock ? "bg-orange-500 text-white" : "bg-[#3A3A3C] text-[#98989D]"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />Блок
                </button>
              </div>

              {isBlock && (
                <div className="flex flex-wrap gap-1">
                  {BLOCK_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setName(s)}
                      className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isBlock ? "БЛОК: Название..." : "Имя гостя"}
                className="w-full h-10 bg-[#1C1C1E] border border-[#3A3A3C] rounded-lg text-white px-3 text-sm outline-none focus:border-[#9ffb00]"
              />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Телефон"
                className="w-full h-10 bg-[#1C1C1E] border border-[#3A3A3C] rounded-lg text-white px-3 text-sm outline-none focus:border-[#9ffb00]"
              />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[#636366] text-xs mb-1 block">Время</label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-10 bg-[#1C1C1E] border border-[#3A3A3C] rounded-lg text-white px-2 text-sm outline-none focus:border-[#9ffb00]"
                  >
                    <option value="">--:--</option>
                    {Array.from({ length: 28 }, (_, i) => {
                      const h = Math.floor(i / 2) + 12;
                      const m = (i % 2) * 30;
                      const displayH = h >= 24 ? h - 24 : h;
                      const timeStr = `${String(displayH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                      return (
                        <option key={timeStr} value={timeStr}>{timeStr}</option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="text-[#636366] text-xs mb-1 block">Гостей</label>
                  <div className="flex items-center h-10 bg-[#1C1C1E] border border-[#3A3A3C] rounded-lg">
                    <button
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="px-2 text-[#98989D]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center text-white text-sm">{guests}</span>
                    <button
                      onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                      className="px-2 text-[#98989D]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[#636366] text-xs mb-1 block">Часов</label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseInt(e.target.value))}
                    className="w-full h-10 bg-[#1C1C1E] border border-[#3A3A3C] rounded-lg text-white px-2 text-sm outline-none focus:border-[#9ffb00]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                      <option key={h} value={h}>{h}ч</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !name.trim() || !time}
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    !isSubmitting && name.trim() && time
                      ? isBlock
                        ? "bg-orange-500 hover:bg-orange-400 text-white"
                        : "bg-[#9ffb00] hover:bg-[#8bdc00] text-black"
                      : "bg-[#3A3A3C] text-[#636366]"
                  }`}
                >
                  {isSubmitting ? "..." : isBlock ? "Заблокировать" : "Создать"}
                </button>
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="py-2.5 px-4 bg-[#3A3A3C] text-white rounded-lg text-sm"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {tableReservations.length === 0 && !showForm ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-[#3A3A3C] mx-auto mb-3" />
              <p className="text-[#98989D]">Нет броней на этот день</p>
              <p className="text-[#636366] text-sm">Нажмите +Добавить+ чтобы создать</p>
            </div>
          ) : (
            tableReservations.map((res) => {
              const isBlocked = isBlockReservation(res);
              const startTime = formatTimeLocal(res.arrival_time);
              const endTime = (() => {
                const t = getLocalHoursMinutes(res.arrival_time);
                if (!t) return "--:--";
                const endMinutes = t.hours * 60 + t.minutes + res.expected_duration_minutes;
                const endH = Math.floor(endMinutes / 60) % 24;
                const endM = endMinutes % 60;
                return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
              })();
              const isProcessing = processingId === res.id;

              return (
                <div
                  key={res.id}
                  className={`bg-[#2C2C2E] rounded-xl p-3 border ${
                    isBlocked ? "border-orange-500/30" : "border-[#3A3A3C]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isBlocked ? "bg-orange-500/20" : res.status === "seated" ? "bg-green-500/20" : "bg-[#9ffb00]/20"
                      }`}>
                        <Clock className={`w-5 h-5 ${
                          isBlocked ? "text-orange-400" : res.status === "seated" ? "text-green-400" : "text-[#9ffb00]"
                        }`} />
                      </div>
                      <div>
                        <p className={`font-bold ${isBlocked ? "text-orange-400" : "text-white"}`}>
                          {startTime} — {endTime}
                        </p>
                        <p className="text-xs text-[#98989D]">{formatDuration(res.expected_duration_minutes)}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      res.status === "seated"
                        ? "bg-green-500/20 text-green-400"
                        : isBlocked
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-[#9ffb00]/20 text-[#9ffb00]"
                    }`}>
                      {res.status === "seated" ? "Сидит" : isBlocked ? "Блок" : "Ждёт"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <User className="w-4 h-4 text-[#636366]" />
                    <span className={isBlocked ? "text-orange-400" : "text-white"}>
                      {res.guest?.name || "Гость"}
                    </span>
                  </div>

                  {!isBlocked && res.guest?.phone && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <Phone className="w-4 h-4 text-[#636366]" />
                      <span className="text-[#98989D]">{res.guest.phone}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {res.status !== "seated" && !isBlocked && (
                      <button
                        onClick={() => handleSeatGuest(res)}
                        disabled={isProcessing}
                        className="flex-1 py-2 bg-[#9ffb00] hover:bg-[#8bdc00] text-black rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        Посадить
                      </button>
                    )}
                    {res.status === "seated" && (
                      <button
                        onClick={() => handleFreeTable(res)}
                        disabled={isProcessing}
                        className="flex-1 py-2 bg-green-500 hover:bg-green-400 text-black rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Ушёл
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel(res)}
                      disabled={isProcessing}
                      className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[#3A3A3C] flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#3A3A3C] hover:bg-[#4A4A4C] text-white rounded-xl text-sm font-medium transition-all"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}
