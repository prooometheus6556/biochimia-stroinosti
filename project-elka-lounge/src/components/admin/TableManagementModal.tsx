"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, AlertTriangle, Plus, Minus } from "lucide-react";
import { createAdminReservation, updateReservationStatus } from "@/app/actions/admin";
import { formatTimeLocal, formatDateLocal } from "@/lib/datetime";
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

function getTodayLocalDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
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

export default function TableManagementModal({
  isOpen,
  onClose,
  onSuccess,
  tables,
  reservations,
  initialTableId,
}: TableManagementModalProps) {
  const [selectedTableId, setSelectedTableId] = useState<string>(initialTableId);
  const [date, setDate] = useState(getTodayLocalDate);
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
      setDate(getTodayLocalDate());
      setShowForm(false);
      resetForm();
    }
  }, [isOpen, initialTableId, resetForm]);

  const handleSeatGuest = async (reservationId: string) => {
    setProcessingId(reservationId);
    try {
      const result = await updateReservationStatus(reservationId, "seated");
      if (!result.success) {
        toast.error(result.error ?? "Ошибка при посадке гостя");
        return;
      }
      toast.success("Гость посажен");
      onSuccess();
    } catch {
      toast.error("Ошибка");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteReservation = async (reservationId: string) => {
    setProcessingId(reservationId);
    try {
      const result = await updateReservationStatus(reservationId, "completed", true);
      if (!result.success) {
        toast.error(result.error ?? "Ошибка при завершении");
        return;
      }
      toast.success("Стол освобождён");
      onSuccess();
    } catch {
      toast.error("Ошибка");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    setProcessingId(reservationId);
    try {
      const result = await updateReservationStatus(reservationId, "cancelled", true);
      if (!result.success) {
        toast.error(result.error ?? "Ошибка при отмене");
        return;
      }
      toast.success("Бронь отменена");
      onSuccess();
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

  const isCurrentlySeated = useMemo(() => {
    return tableReservations.some(r => r.status === "seated");
  }, [tableReservations]);

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

        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#9ffb00]/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-black text-[#9ffb00]">
                {selectedTable?.number ?? "?"}
              </span>
            </div>
            <div>
              <h2 className="text-white text-lg font-bold leading-tight">
                Стол {selectedTable?.number}
              </h2>
              <span className="text-[#636366] text-xs">{formatDateLocal(date + "T00:00:00")}</span>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-md ${
            isCurrentlySeated
              ? "bg-orange-500/20 text-orange-400"
              : "bg-green-500/20 text-green-400"
          }`}>
            {isCurrentlySeated ? "За столом" : "Свободен"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-1 mr-1">
          <div className="flex flex-col gap-3 w-full">

            {tableReservations.length === 0 && !showForm && (
              <div className="text-center py-6 text-[#636366] text-sm">
                Нет броней на сегодня
              </div>
            )}

            {tableReservations.map((res) => {
              const isBlocked = isBlockReservation(res);
              const startTime = formatTimeLocal(res.arrival_time);
              const isProcessing = processingId === res.id;
              const durHours = Math.floor(res.expected_duration_minutes / 60);
              const durText = durHours >= 1 ? `${durHours} ч` : `${res.expected_duration_minutes}м`;

              return (
                <div
                  key={res.id}
                  className={`flex flex-row items-center justify-between bg-[#1A1D21] border border-[#2A2D32] p-4 rounded-xl w-full ${
                    isBlocked ? "border-orange-500/30" : res.status === "seated" ? "border-green-500/30" : ""
                  }`}
                >
                  <div className="flex flex-col min-w-[80px]">
                    <span className={`text-white font-bold text-lg ${isBlocked ? "text-orange-400" : ""}`}>
                      {startTime}
                    </span>
                    <span className="text-gray-400 text-sm">{durText}</span>
                  </div>

                  <div className="flex flex-col flex-1 border-l border-[#2A2D32] ml-4 pl-4 text-left">
                    <span className={`text-white font-medium ${isBlocked ? "text-orange-400" : ""}`}>
                      {res.guest?.name || "Гость"}
                    </span>
                    <span className="text-gray-400 text-sm">
                      👤 {res.guest_count || 1} | 📞 {res.guests?.phone || "Нет номера"}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-2 min-w-[140px]">
                    <span className={`text-xs px-2 py-1 rounded-md ${
                      res.status === "seated"
                        ? "bg-green-500/20 text-green-400"
                        : isBlocked
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-[#9ffb00]/15 text-[#9ffb00]"
                    }`}>
                      {res.status === "seated" ? "За столом" : isBlocked ? "Блок" : "Ожидает"}
                    </span>
                    
                    <div className="flex gap-2 w-full">
                      {isProcessing ? (
                        <span className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : res.status === "seated" ? (
                        <>
                          <button
                            onClick={() => handleCompleteReservation(res.id)}
                            className="bg-[#9ffb00] text-black px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-[#8bdc00] transition flex-1"
                          >
                            Завершить
                          </button>
                          <button
                            onClick={onClose}
                            className="bg-[#2A2D32] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#3A3D42] transition"
                          >
                            Закрыть
                          </button>
                        </>
                      ) : (
                        <>
                          {!isBlocked && (
                            <button
                              onClick={() => handleSeatGuest(res.id)}
                              className="bg-[#9ffb00] text-black px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-[#8bdc00] transition flex-1"
                            >
                              Посадить
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelReservation(res.id)}
                            className="bg-[#2A2D32] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-500/20 hover:text-red-500 transition"
                          >
                            Отмена
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {showForm && (
              <div className="bg-[#2C2C2E] rounded-xl p-3 space-y-2 border border-[#9ffb00]/30">
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsBlock(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      !isBlock ? "bg-[#9ffb00] text-black" : "bg-[#3A3A3C] text-[#98989D]"
                    }`}
                  >
                    Гость
                  </button>
                  <button
                    onClick={() => setIsBlock(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                      isBlock ? "bg-orange-500 text-white" : "bg-[#3A3A3C] text-[#98989D]"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />Блок
                  </button>
                </div>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isBlock ? "БЛОК: Название..." : "Имя гостя"}
                  className="w-full h-9 bg-[#1C1C1E] border border-[#3A3A3C] rounded-lg text-white px-3 text-sm outline-none focus:border-[#9ffb00]"
                />

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-9 bg-[#1C1C1E] border border-[#3A3A3C] rounded-lg text-white px-2 text-sm outline-none focus:border-[#9ffb00]"
                  >
                    <option value="">Время</option>
                    {Array.from({ length: 28 }, (_, i) => {
                      const h = Math.floor(i / 2) + 12;
                      const m = (i % 2) * 30;
                      const displayH = h >= 24 ? h - 24 : h;
                      const timeStr = `${String(displayH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                      return <option key={timeStr} value={timeStr}>{timeStr}</option>;
                    })}
                  </select>
                  <div className="flex items-center h-9 bg-[#1C1C1E] border border-[#3A3A3C] rounded-lg overflow-hidden">
                    <button
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="px-2 text-[#98989D] hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center text-white text-xs">{guests} 👤</span>
                    <button
                      onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                      className="px-2 text-[#98989D] hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseInt(e.target.value))}
                    className="h-9 bg-[#1C1C1E] border border-[#3A3A3C] rounded-lg text-white px-2 text-sm outline-none focus:border-[#9ffb00]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                      <option key={h} value={h}>{h}ч</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !name.trim() || !time}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
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
                    className="px-3 py-2 bg-[#3A3A3C] text-white rounded-lg text-sm hover:bg-[#4A4A4C]"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full mt-3 pt-3 border-t border-dashed border-[#3A3A3C] text-[#636366] py-2 hover:text-[#9ffb00] hover:border-[#9ffb00]/50 transition font-medium text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Добавить бронь на этот стол
          </button>
        )}
      </div>
    </div>
  );
}
