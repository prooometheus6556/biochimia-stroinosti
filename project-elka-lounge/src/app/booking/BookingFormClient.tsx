"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createReservation, fetchReservationsForDate, TableInfo } from "@/app/actions";
import Link from "next/link";
import { toast } from "sonner";
import { X, User, Phone } from "lucide-react";
import { toDisplayNumber } from "@/lib/tableDisplay";

interface BookingFormClientProps {
  tables: TableInfo[];
}

const CAPACITY_LARGE = 6;
const CAPACITY_SMALL = 2;

const TABLE_CAPACITY_MAP: Record<string, number> = {
  '0': CAPACITY_LARGE,
  '1': CAPACITY_LARGE,
  '2': CAPACITY_SMALL,
  '3': CAPACITY_LARGE,
  '4': CAPACITY_LARGE,
  '5': CAPACITY_LARGE,
  '6': CAPACITY_LARGE,
  '7': CAPACITY_LARGE,
  '8': CAPACITY_LARGE,
  '9': CAPACITY_LARGE,
  '10': CAPACITY_LARGE,
  '11': CAPACITY_SMALL,
  '11.5': CAPACITY_SMALL,
  '12': CAPACITY_LARGE,
};

function getTableCapacity(table: TableInfo): number {
  const hardcoded = TABLE_CAPACITY_MAP[table.number];
  if (hardcoded !== undefined) return hardcoded;
  if (table.capacity && table.capacity > 0) return table.capacity;
  return CAPACITY_LARGE;
}

const getTableEmoji = (features: string[], number: string) => {
  if (features.includes('window_view') || ['1', '2', '3', '4', '5', '6', '7', '11.5'].includes(number)) {
    return '🌆';
  }
  if (features.includes('ps5') || ['10', '12'].includes(number)) {
    return '🎮';
  }
  return '🪑';
};

const getTableZone = (number: string): 'city' | 'ps5' | 'standard' => {
  if (['1', '2', '3', '4', '5', '6', '7', '11.5'].includes(number)) return 'city';
  if (['10', '12'].includes(number)) return 'ps5';
  return 'standard';
};

interface BookingSuccess {
  name: string;
  date: string;
  time: string;
  tableName: string;
}

interface DayReservation {
  id: string;
  table_id: string | null;
  arrival_time: string;
  expected_duration_minutes: number;
  status: string;
}

interface User {
  id: string;
  telegram_id?: string;
  phone: string;
  name: string;
}

const MIN_BOOKING_BUFFER_MINUTES = 30;
const OPEN_HOUR = 12;
const CLOSE_HOUR_WEEKDAY = 2;
const CLOSE_HOUR_WEEKEND = 4;
const MAX_SELF_BOOKING_GUESTS = 6;

function getLogicalDayOfWeek(dateStr: string, timeStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const hours = parseInt(timeStr.split(':')[0], 10);
  
  const selectedDate = new Date(year, month - 1, day);
  
  if (hours >= 0 && hours < OPEN_HOUR) {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    return prevDay.getDay();
  }
  
  return selectedDate.getDay();
}

function isWeekendDay(dayOfWeek: number): boolean {
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function getClosingHour(dayOfWeek: number): number {
  return isWeekendDay(dayOfWeek) ? CLOSE_HOUR_WEEKEND : CLOSE_HOUR_WEEKDAY;
}

function getClosingTimeStr(dayOfWeek: number): string {
  return isWeekendDay(dayOfWeek) ? "04:00" : "02:00";
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

function validateBooking(dateStr: string, timeStr: string, durationMinutes: number): ValidationResult {
  if (!dateStr || !timeStr) {
    return { valid: false, error: "Выберите дату и время" };
  }

  const [hours, minutes] = timeStr.split(':').map(Number);
  const [year, month, day] = dateStr.split('-').map(Number);

  const selectedDate = new Date(year, month - 1, day);
  const selectedTimeMinutes = hours * 60 + minutes;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (selectedDate.getTime() === today.getTime()) {
    const minBookingTime = nowMinutes + MIN_BOOKING_BUFFER_MINUTES;
    if (selectedTimeMinutes < minBookingTime) {
      return {
        valid: false,
        error: `Бронь возможна минимум за ${MIN_BOOKING_BUFFER_MINUTES} минут до визита`
      };
    }
  }

  const logicalDayOfWeek = getLogicalDayOfWeek(dateStr, timeStr);
  const closeHour = getClosingHour(logicalDayOfWeek);
  const openMinutes = OPEN_HOUR * 60;
  const closeMinutes = closeHour * 60;

  const isValidTimeRange = 
    (selectedTimeMinutes >= openMinutes && selectedTimeMinutes <= 23 * 60 + 59) ||
    (selectedTimeMinutes >= 0 && selectedTimeMinutes <= closeMinutes);

  if (!isValidTimeRange) {
    const closeTimeStr = getClosingTimeStr(logicalDayOfWeek);
    return {
      valid: false,
      error: `В это время заведение закрыто. Мы работаем с 12:00 до ${closeTimeStr}`
    };
  }

  const endTimeMinutes = selectedTimeMinutes + durationMinutes;
  
  if (endTimeMinutes > closeMinutes + 60) {
    const closeTimeStr = getClosingTimeStr(logicalDayOfWeek);
    return {
      valid: true,
      warning: `Обратите внимание: заведение закроется в ${closeTimeStr}, а ваша бронь до ${formatMinutesToTime(endTimeMinutes)}`
    };
  }

  return { valid: true };
}

function formatMinutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function validateFormData(formData: {
  name: string;
  phone: string;
  guests: number;
  durationHours: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!formData.name.trim() || formData.name.trim().length < 2) {
    errors.push("Введите ваше имя (минимум 2 символа)");
  }

  const phoneDigits = formData.phone.replace(/\D/g, '');
  if (phoneDigits.length !== 10) {
    errors.push("Введите корректный номер телефона (10 цифр)");
  }

  if (formData.guests < 1) {
    errors.push("Укажите количество гостей");
  }

  if (formData.durationHours < 1) {
    errors.push("Укажите планируемое время пребывания");
  }

  return { valid: errors.length === 0, errors };
}

function timeToMinutes(dateStr: string, timeStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return date.getTime() / 60000;
}

function checkTimeOverlap(
  newStart: number,
  newEnd: number,
  existingStart: number,
  existingDuration: number
): boolean {
  const existingEnd = existingStart + existingDuration;
  return newStart < existingEnd && newEnd > existingStart;
}

function isTableAvailable(
  tableId: string,
  newStartMinutes: number,
  newDuration: number,
  dayReservations: DayReservation[]
): boolean {
  const existingReservations = dayReservations.filter(r => r.table_id === tableId);
  
  if (existingReservations.length === 0) return true;
  
  for (const res of existingReservations) {
    const [year, month, day] = res.arrival_time.split('T')[0].split('-').map(Number);
    const [h, m] = res.arrival_time.split('T')[1].split(':').map(Number);
    const existingStart = timeToMinutes(`${year}-${month}-${day}`, `${h}:${m}`);
    const existingDuration = res.expected_duration_minutes;
    
    if (checkTimeOverlap(newStartMinutes, newStartMinutes + newDuration, existingStart, existingDuration)) {
      return false;
    }
  }
  
  return true;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  if (!isOpen) return null;

  const handleTelegramLogin = () => {
    onLoginSuccess({ id: '', phone: '', name: '' });
  };

  const handlePhoneLogin = () => {
    onLoginSuccess({ id: '', phone: '', name: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#2C2C2E] border border-[#3A3A3C] rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#98989D] hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#9ffb00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-[#9ffb00]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Вход в личный кабинет</h2>
          <p className="text-[#98989D] text-sm">Войдите, чтобы отслеживать свои брони</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleTelegramLogin}
            className="w-full py-4 px-6 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Войти через Telegram
          </button>

          <button
            onClick={handlePhoneLogin}
            className="w-full py-4 px-6 bg-[#3A3A3C] hover:bg-[#4A4A4C] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <Phone className="w-5 h-5" />
            Войти по номеру телефона
          </button>

          <button
            onClick={() => {
              onClose();
              onLoginSuccess({ id: '', phone: '', name: '' });
            }}
            className="w-full py-3 text-[#98989D] hover:text-white text-sm transition-colors"
          >
            Продолжить без входа
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingFormClient({ tables }: BookingFormClientProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    durationHours: 3,
    durationMinutes: 0,
    guests: 2,
    tableId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<BookingSuccess | null>(null);
  const [minDate, setMinDate] = useState("");
  const [dayReservations, setDayReservations] = useState<DayReservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [resetReason, setResetReason] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    setMinDate(today.toISOString().split('T')[0]);
  }, []);

  const loadReservationsForDate = useCallback(async (date: string) => {
    if (!date) {
      setDayReservations([]);
      return;
    }
    
    setIsLoadingReservations(true);
    try {
      const reservations = await fetchReservationsForDate(date);
      setDayReservations(reservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setIsLoadingReservations(false);
    }
  }, []);

  useEffect(() => {
    if (formData.date) {
      loadReservationsForDate(formData.date);
    }
  }, [formData.date, loadReservationsForDate]);

  const expectedDuration = formData.durationHours * 60 + formData.durationMinutes;

  const newBookingStartMinutes = useMemo(() => {
    if (!formData.date || !formData.time) return 0;
    const [year, month, day] = formData.date.split('-').map(Number);
    const [hours, minutes] = formData.time.split(':').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return date.getTime() / 60000;
  }, [formData.date, formData.time]);

  const tablesWithCapacity = useMemo(() => {
    return tables.map(table => ({
      ...table,
      capacity: getTableCapacity(table),
    }));
  }, [tables]);

  const availableTables = useMemo(() => {
    if (!formData.date || !formData.time) return tablesWithCapacity;
    
    return tablesWithCapacity.filter(table => {
      const capacity = getTableCapacity(table);
      if (capacity < formData.guests) return false;
      
      if (!isTableAvailable(table.id, newBookingStartMinutes, expectedDuration, dayReservations)) {
        return false;
      }
      
      return true;
    });
  }, [tablesWithCapacity, formData.guests, newBookingStartMinutes, expectedDuration, dayReservations, formData.date, formData.time]);

  const availableTableIds = useMemo(() => new Set(availableTables.map(t => t.id)), [availableTables]);

  const isLargeGroup = formData.guests > MAX_SELF_BOOKING_GUESTS;

  const availableCapacityTables = useMemo(() => {
    return tablesWithCapacity.filter(table => getTableCapacity(table) >= formData.guests);
  }, [tablesWithCapacity, formData.guests]);

  useEffect(() => {
    if (formData.tableId && !availableTableIds.has(formData.tableId)) {
      setFormData(prev => ({ ...prev, tableId: "" }));
      toast.info(resetReason || "Выбранный стол стал недоступен, выберите другой", {
        position: "top-center",
        duration: 4000,
      });
      setResetReason(null);
    }
  }, [availableTableIds, formData.tableId, resetReason]);

  const handleGuestsChange = (guests: number) => {
    const oldGuests = formData.guests;
    setFormData(prev => ({ ...prev, guests, tableId: "" }));
    
    if (guests > oldGuests && guests > MAX_SELF_BOOKING_GUESTS) {
      toast.info("Для больших компаний, пожалуйста, свяжитесь с нами по телефону для объединения столов", {
        position: "top-center",
        duration: 6000,
      });
    } else if (guests > oldGuests && availableCapacityTables.length < tablesWithCapacity.length) {
      setResetReason("Количество гостей увеличилось — некоторые столы стали недоступны");
    }
  };

  const isFormValid = useMemo(() => {
    const phoneDigits = formData.phone.replace(/\D/g, '');
    return (
      formData.name.trim().length > 1 &&
      phoneDigits.length === 10 &&
      formData.date !== "" &&
      formData.time !== "" &&
      formData.durationHours > 0 &&
      formData.guests > 0 &&
      !isLargeGroup
    );
  }, [formData, isLargeGroup]);

  const hasAvailableTables = availableTables.length > 0 || !formData.tableId;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, '').slice(0, 10);
    const formatted = formatPhoneDisplay(digits);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsLoginModalOpen(true);
    return;
  };

  const handleConfirmedSubmit = async () => {
    setIsLoginModalOpen(false);
    setIsSubmitting(true);

    const formValidation = validateFormData(formData);
    if (!formValidation.valid) {
      formValidation.errors.forEach((error) => {
        toast.error(error, { position: "top-center" });
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.date || !formData.time) {
      toast.error("Выберите дату и время визита", { position: "top-center" });
      setIsSubmitting(false);
      return;
    }

    const timeValidation = validateBooking(formData.date, formData.time, expectedDuration);
    
    if (!timeValidation.valid) {
      toast.error(timeValidation.error!, { position: "top-center" });
      setIsSubmitting(false);
      return;
    }

    if (timeValidation.warning) {
      toast.warning(timeValidation.warning, { 
        position: "top-center",
        duration: 6000,
      });
    }

    const phoneToSend = `+7 ${formData.phone}`;

    try {
      const result = await createReservation({
        name: formData.name.trim(),
        phone: phoneToSend,
        date: formData.date,
        time: formData.time,
        guests: formData.guests,
        tableId: formData.tableId,
        expected_duration_minutes: expectedDuration,
      });

      if (result.success && result.booking) {
        setBookingSuccess({
          name: result.booking.name,
          date: result.booking.date,
          time: result.booking.time,
          tableName: result.booking.tableName,
        });
        toast.success(result.message, { position: "top-center" });
      } else {
        toast.error(result.message || "Произошла ошибка при бронировании", {
          position: "top-center",
          duration: 5000,
        });
      }
    } catch {
      toast.error("Произошла непредвиденная ошибка. Попробуйте ещё раз.", {
        position: "top-center",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTableSelect = (tableId: string) => {
    setFormData(prev => ({ ...prev, tableId: prev.tableId === tableId ? "" : tableId }));
  };

  if (bookingSuccess) {
    return (
      <div className="w-full max-w-md flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="w-24 h-24 rounded-full bg-[#9ffb00]/20 flex items-center justify-center mb-8">
          <span className="text-5xl text-[#9ffb00]">✓</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Бронь подтверждена!</h2>
        <p className="text-gray-400 mb-8">Мы свяжемся с вами для подтверждения</p>
        
        <div className="w-full bg-[#2C2C2E] rounded-2xl border border-[#3A3A3C] p-6 mb-8 space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Гость</span>
            <span className="text-white font-medium">{bookingSuccess.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Дата</span>
            <span className="text-white font-medium">{formatDateDisplay(bookingSuccess.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Время</span>
            <span className="text-white font-medium">{bookingSuccess.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Стол</span>
            <span className="text-[#9ffb00] font-bold">{bookingSuccess.tableName}</span>
          </div>
        </div>

        <Link 
          href="/"
          className="w-full py-4 px-6 bg-[#9ffb00] hover:bg-[#8bdc00] text-black font-bold text-lg rounded-2xl transition-all text-center block"
        >
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleConfirmedSubmit}
      />
      
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
          <span className="material-symbols-outlined mr-2">arrow_back</span>
          На главную
        </Link>

        <div className="space-y-1">
          <label className="text-gray-400 text-sm">Ваше имя</label>
          <input
            type="text"
            placeholder="Как к вам обращаться?"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full h-14 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-lg outline-none focus:border-[#9ffb00] focus:ring-1 focus:ring-[#9ffb00]/50 transition-all box-border"
          />
        </div>

        <div className="space-y-1">
          <label className="text-gray-400 text-sm">Номер телефона</label>
          <div className="h-14 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl flex items-center px-4">
            <span className="text-gray-400 mr-2 text-lg">+7</span>
            <input
              type="tel"
              maxLength={15}
              inputMode="numeric"
              className="bg-transparent outline-none flex-1 text-lg text-white placeholder-[#3A3A3C]"
              placeholder="(999) 123-45-67"
              value={formData.phone}
              onChange={handlePhoneChange}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-gray-400 text-sm">Дата визита</label>
          <input
            type="date"
            min={minDate}
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value, tableId: "" }))}
            className="w-full h-14 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-lg outline-none focus:border-[#9ffb00] focus:ring-1 focus:ring-[#9ffb00]/50 transition-all box-border appearance-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-gray-400 text-sm">Время визита</label>
          <input
            type="time"
            step="900"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value, tableId: "" }))}
            className="w-full h-14 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-lg outline-none focus:border-[#9ffb00] focus:ring-1 focus:ring-[#9ffb00]/50 transition-all box-border appearance-none"
          />
          <p className="text-xs text-[#636366] mt-1">
            Бронируем: Пн-Чт, Вс — до 02:00; Пт-Сб — до 04:00
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-gray-400 text-sm">Планируемое время пребывания</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <select
                value={formData.durationHours}
                onChange={(e) => setFormData(prev => ({ ...prev, durationHours: parseInt(e.target.value), tableId: "" }))}
                className="w-full h-14 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-lg outline-none focus:border-[#9ffb00] focus:ring-1 focus:ring-[#9ffb00]/50 transition-all box-border appearance-none cursor-pointer pr-8"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                  <option key={h} value={h}>{h} {h === 1 ? 'час' : h < 5 ? 'часа' : 'часов'}</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3A3A3C] pointer-events-none">▼</span>
            </div>
            <div className="flex-1 relative">
              <select
                value={formData.durationMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value), tableId: "" }))}
                className="w-full h-14 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-lg outline-none focus:border-[#9ffb00] focus:ring-1 focus:ring-[#9ffb00]/50 transition-all box-border appearance-none cursor-pointer pr-8"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>{m.toString().padStart(2, '0')} мин</option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3A3A3C] pointer-events-none">▼</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-gray-400 text-sm">Количество гостей</label>
            {isLargeGroup && (
              <span className="text-xs text-orange-400">Более {MAX_SELF_BOOKING_GUESTS} гостей</span>
            )}
          </div>
          <div className="relative">
            <select
              value={formData.guests}
              onChange={(e) => handleGuestsChange(parseInt(e.target.value))}
              className="w-full h-14 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl text-white px-4 text-lg outline-none focus:border-[#9ffb00] focus:ring-1 focus:ring-[#9ffb00]/50 transition-all box-border appearance-none cursor-pointer pr-8"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'гость' : n < 5 ? 'гостя' : 'гостей'}</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3A3A3C] pointer-events-none">▼</span>
          </div>
          {isLargeGroup && (
            <div className="p-3 rounded-xl bg-orange-900/20 border border-orange-500/30 text-orange-400 text-sm">
              Для больших компаний, пожалуйста, свяжитесь с нами по телефону для объединения столов
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-gray-400 text-sm">Выберите стол</label>
            {isLoadingReservations && (
              <span className="text-xs text-[#636366] animate-pulse">Загрузка...</span>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {tables.map((table) => {
              const emoji = getTableEmoji(table.features, table.number);
              const zone = getTableZone(table.number);
              const capacity = getTableCapacity(table);
              const displayNumber = toDisplayNumber(table.number);
              const isAvailable = availableTableIds.has(table.id);
              const hasCapacity = capacity >= formData.guests;
              const isSelectable = isAvailable && hasCapacity;
              const isSelected = formData.tableId === table.id;
              
              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => isSelectable && handleTableSelect(table.id)}
                  disabled={!isSelectable}
                  className={`
                    relative p-3 rounded-xl border-2 text-center transition-all
                    ${!isSelectable ? 'opacity-40 cursor-not-allowed' : isSelected ? 'border-[#9ffb00] bg-[#9ffb00]/20' : 'border-[#3A3A3C] bg-[#2C2C2E] hover:border-[#4A4A4C]'}
                    ${zone === 'city' ? 'ring-1 ring-blue-500/20' : ''}
                    ${zone === 'ps5' ? 'ring-1 ring-purple-500/20' : ''}
                  `}
                >
                  <div className="text-2xl">{emoji}</div>
                  <div className="text-xs text-gray-400">{displayNumber}</div>
                  {zone === 'city' && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />}
                  {zone === 'ps5' && <div className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />}
                  {!hasCapacity && (
                    <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                      <span className="text-red-400 text-xs font-bold">×{capacity}</span>
                    </div>
                  )}
                  {!isAvailable && hasCapacity && (
                    <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                      <span className="text-red-400 text-xs font-bold">занят</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span> CITY
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span> PS5
            </span>
            <span className="text-gray-500">· {availableTables.length} из {tables.length} свободно</span>
          </div>

          {!hasAvailableTables && formData.date && formData.time && (
            <div className="p-3 rounded-xl bg-orange-900/20 border border-orange-500/30 text-orange-400 text-sm">
              На выбранное время все столы заняты. Попробуйте изменить время или дату.
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isFormValid || !hasAvailableTables}
          className={`w-full py-5 px-6 font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-2 ${
            !isSubmitting && isFormValid && hasAvailableTables
              ? 'bg-[#9ffb00] hover:bg-[#8bdc00] text-black cursor-pointer shadow-[0_0_30px_rgba(159,251,0,0.3)]'
              : 'bg-[#3A3A3C] text-[#636366] cursor-not-allowed'
          }`}
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
            "Забронировать"
          )}
        </button>

        {(!isFormValid || !hasAvailableTables) && (
          <p className="text-center text-sm text-[#636366]">
            {!hasAvailableTables ? "Нет доступных столов на выбранное время" : 
             isLargeGroup ? "Для больших компаний — звоните" : "Заполните все обязательные поля"}
          </p>
        )}
      </form>
    </>
  );
}

function formatPhoneDisplay(digits: string): string {
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 8) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
}

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
