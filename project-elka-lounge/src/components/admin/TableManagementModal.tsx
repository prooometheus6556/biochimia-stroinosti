"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

  const tableReservations = useMemo(() => {
    if (!selectedTableId || !date) return [];
    return getTableReservationsForDay(selectedTableId, reservations, date);
  }, [selectedTableId, reservations, date]);

  const resetForm = useCallback(() => {
    setName("");
    setPhone("");
    setTime("");
    setGuests(6);
    setDurationHours(3);
    setIsBlock(false);
  }, []);

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
  }, [isSubmitting, selectedTableId, date, time, name, phone, guests, durationHours, isBlock, resetForm, onSuccess]);

  const isCurrentlySeated = useMemo(() => {
    return tableReservations.some(r => r.status === "seated");
  }, [tableReservations]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121417] border border-[#2A2D32] rounded-2xl p-6 w-full max-w-2xl flex flex-col gap-4">
        
        {/* ЗАГОЛОВОК С МЕТКОЙ ВЕРСИИ */}
        <div className="flex items-center justify-between mb-4 border-b border-[#2A2D32] pb-4">
          <div className="flex flex-col">
            <h2 className="text-white text-xl font-bold flex items-center gap-2">
              Управление столом {selectedTable?.number}
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">v3.0-TIMELINE</span>
            </h2>
            <span className="text-gray-400 text-sm">{formatDateLocal(date + "T00:00:00")}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* ЕДИНАЯ ЛЕНТА БРОНЕЙ */}
        <div className="flex flex-col gap-3 w-full">
          {tableReservations.length === 0 ? (
            <div className="text-gray-500 text-center py-8 bg-[#1A1D21] rounded-xl border border-dashed border-[#2A2D32]">Нет броней на этот день</div>
          ) : (
            tableReservations.map((res) => (
              <div key={res.id} className="flex flex-row items-center justify-between bg-[#1A1D21] border border-[#2A2D32] p-4 rounded-xl w-full">
                
                {/* 1. Время */}
                <div className="flex flex-col min-w-[80px]">
                  <span className="text-white font-bold text-lg">{formatTimeLocal(res.arrival_time)}</span>
                  <span className="text-gray-400 text-sm">{res.expected_duration_minutes / 60} ч</span>
                </div>

                {/* 2. Гость */}
                <div className="flex flex-col flex-1 border-l border-[#2A2D32] ml-4 pl-4 text-left">
                  <span className="text-white font-medium">{res.guest?.name || 'Гость'}</span>
                  <span className="text-gray-400 text-sm">📞 {res.guest?.phone || 'Нет номера'}</span>
                </div>

                {/* 3. Действия */}
                <div className="flex flex-col items-end gap-2 min-w-[140px]">
                  <span className={`text-xs px-2 py-1 rounded-md ${res.status === 'seated' ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                    {res.status === 'seated' ? 'За столом' : 'Ожидает'}
                  </span>
                  
                  <div className="flex gap-2 w-full mt-1">
                    {res.status === 'seated' ? (
                        <button onClick={() => handleCompleteReservation(res.id)} className="bg-[#B5FF3B] text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#a0e635] transition flex-1">Завершить</button>
                    ) : (
                      <>
                        <button onClick={() => handleSeatGuest(res.id)} className="bg-[#B5FF3B] text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#a0e635] transition flex-1">Посадить</button>
                        <button onClick={() => handleCancelReservation(res.id)} className="bg-[#2A2D32] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-500/20 transition">Отмена</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* 4. Кнопка Добавления */}
          <button onClick={() => setShowForm(true)} className="w-full mt-2 border-2 border-dashed border-[#2A2D32] text-gray-400 py-3 rounded-xl hover:border-[#B5FF3B] hover:text-[#B5FF3B] transition font-medium bg-[#1A1D21]/50">
            + Добавить бронь на этот стол
          </button>
        </div>

        {/* Форма добавления */}
        {showForm && (
          <div className="bg-[#1A1D21] border border-[#9ffb00]/30 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-10 bg-[#121417] border border-[#2A2D32] rounded-lg text-white px-2 text-sm outline-none focus:border-[#B5FF3B]"
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
              <div className="flex items-center h-10 bg-[#121417] border border-[#2A2D32] rounded-lg">
                <button onClick={() => setGuests(g => Math.max(1, g - 1))} className="px-3 text-gray-400 hover:text-white">−</button>
                <span className="flex-1 text-center text-white text-sm">{guests} 👤</span>
                <button onClick={() => setGuests(g => Math.min(20, g + 1))} className="px-3 text-gray-400 hover:text-white">+</button>
              </div>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value))}
                className="h-10 bg-[#121417] border border-[#2A2D32] rounded-lg text-white px-2 text-sm outline-none focus:border-[#B5FF3B]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{h}ч</option>)}
              </select>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя гостя"
              className="w-full h-10 bg-[#121417] border border-[#2A2D32] rounded-lg text-white px-3 text-sm outline-none focus:border-[#B5FF3B]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !name.trim() || !time}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${!isSubmitting && name.trim() && time ? 'bg-[#B5FF3B] text-black hover:bg-[#a0e635]' : 'bg-[#2A2D32] text-gray-500'}`}
              >
                {isSubmitting ? "..." : "Создать"}
              </button>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2.5 bg-[#2A2D32] text-white rounded-lg hover:bg-[#3A3A3C]">×</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
