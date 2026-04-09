"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const NOVOSIBIRSK_OFFSET_HOURS = 7;

function toLocalISOStringWithOffset(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00+07:00`;
}

function parseLocalDateTime(dateStr: string, timeStr: string): { utc: Date } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const [year, month, day] = dateStr.split('-').map(Number);
  
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const utcTimestamp = localDate.getTime() - (NOVOSIBIRSK_OFFSET_HOURS * 3600000);
  const utcDate = new Date(utcTimestamp);
  
  return { utc: utcDate };
}

export interface TableInfo {
  id: string;
  number: string;
  capacity: number;
  features: string[];
}

interface BookingData {
  phone: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  tableId: string;
  expected_duration_minutes: number;
}

interface TelegramNotificationData {
  phone: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  expected_duration_minutes: number;
  tableName?: string;
}

interface SafeBookingResult {
  success: boolean;
  data?: {
    id: string;
    guest_id: string;
    table_id: string;
    arrival_time: string;
  };
  error?: string;
}

export async function getTables(): Promise<TableInfo[]> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from("tables")
      .select("id, number, capacity, features")
      .eq("is_active", true)
      .order("number");

    if (error) {
      console.error('[TABLES] Error fetching tables:', error);
      return [];
    }

    return (data || []).map(t => ({
      id: t.id,
      number: t.number.toString(),
      capacity: t.capacity || 4,
      features: t.features || [],
    }));
  } catch (error) {
    console.error('[TABLES] Unexpected error:', error);
    return [];
  }
}

interface DayReservation {
  id: string;
  table_id: string | null;
  arrival_time: string;
  expected_duration_minutes: number;
  status: string;
}

export async function fetchReservationsForDate(dateStr: string): Promise<DayReservation[]> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const [year, month, day] = dateStr.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    
    const startUTC = new Date(startOfDay.getTime() - (NOVOSIBIRSK_OFFSET_HOURS * 3600000)).toISOString();
    const endUTC = new Date(endOfDay.getTime() - (NOVOSIBIRSK_OFFSET_HOURS * 3600000)).toISOString();

    const { data, error } = await supabase
      .from("reservations")
      .select("id, table_id, arrival_time, expected_duration_minutes, status")
      .gte("arrival_time", startUTC)
      .lte("arrival_time", endUTC)
      .neq("status", "completed")
      .neq("status", "cancelled");

    if (error) {
      console.error('[RESERVATIONS] Error fetching reservations:', error);
      return [];
    }

    return (data || []) as DayReservation[];
  } catch (error) {
    console.error('[RESERVATIONS] Unexpected error:', error);
    return [];
  }
}

function getTableDisplayName(tableNumber: string, features: string[]): string {
  if (features.includes('ps5') || tableNumber === '10' || tableNumber === '12') {
    return `PS5 — Стол ${tableNumber}`;
  }
  if (features.includes('window_view') || ['1', '2', '3', '4', '5', '6', '7'].includes(tableNumber)) {
    return `CITY — Стол ${tableNumber}`;
  }
  return `Стол ${tableNumber}`;
}

async function sendTelegramNotification(booking: TelegramNotificationData) {
  console.log('[TELEGRAM] Checking configuration...');
  console.log('[TELEGRAM] BOT_TOKEN exists:', !!TELEGRAM_BOT_TOKEN);
  console.log('[TELEGRAM] CHAT_ID exists:', !!TELEGRAM_CHAT_ID);

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('[TELEGRAM] KEYS MISSING! BOT_TOKEN or CHAT_ID not set in environment');
    return;
  }

  const tableInfo = booking.tableName ? `\n🪑 Стол: ${booking.tableName}` : '';

  const message = `🔔 *Новая бронь!*

👤 Гость: *${booking.name}*
📞 Телефон: ${booking.phone}
📅 Дата: ${booking.date}
🕐 Время: ${booking.time}
👥 Гостей: ${booking.guests}
⏱ Длительность: ${booking.expected_duration_minutes} мин${tableInfo}`;

  try {
    console.log('[TELEGRAM] Sending message...');
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    const result = await response.json();
    console.log('[TELEGRAM] API Response:', JSON.stringify(result));

    if (!response.ok) {
      console.error('[TELEGRAM] API Error:', result);
    } else {
      console.log('[TELEGRAM] Notification sent successfully!');
    }
  } catch (error) {
    console.error('[TELEGRAM] Failed to send notification:', error);
  }
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function createReservation(data: BookingData) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { phone, name, date, time, guests: guestsCount, expected_duration_minutes } = data;

    // Validate tableId is a valid UUID
    const safeTableId = (data.tableId && isValidUUID(data.tableId)) ? data.tableId : null;
    let tableDisplayName: string | undefined;

    // Get table info if selected
    if (safeTableId) {
      const { data: tableData } = await supabase
        .from("tables")
        .select("number, features")
        .eq("id", safeTableId)
        .single();
      
      if (tableData) {
        tableDisplayName = getTableDisplayName(
          tableData.number.toString(),
          tableData.features || []
        );
      }
    }

    // 1. Validate date/time - prevent past bookings (using UTC+7)
    const { utc: reservationUTC } = parseLocalDateTime(date, time);
    const now = new Date();
    
    if (reservationUTC < now) {
      return { 
        success: false, 
        message: "Нельзя забронировать на прошедшее время" 
      };
    }

    // 2. Use safe booking RPC (handles atomic check + insert with table lock)
    console.log('[BOOKING] Calling safe booking RPC...');
    
    console.log('[BOOKING] Отправка в RPC:', {
      p_table_id: safeTableId,
      p_arrival_time: toLocalISOStringWithOffset(date, time),
      p_expected_duration_minutes: expected_duration_minutes,
      p_guest_name: name,
      p_guest_phone: phone,
      p_guests_count: guestsCount,
    });

    const { data: rpcResult, error: rpcError } = await supabase.rpc('book_table_safe', {
      p_table_id: safeTableId,
      p_arrival_time: toLocalISOStringWithOffset(date, time),
      p_expected_duration_minutes: expected_duration_minutes,
      p_guest_name: name,
      p_guest_phone: phone,
      p_guests_count: guestsCount,
    });

    if (rpcError) {
      console.error('[BOOKING] RPC Error:', rpcError);
      return { success: false, message: `Ошибка базы данных: ${rpcError.message}` };
    }

    const bookingResult = rpcResult as SafeBookingResult;

    if (!bookingResult.success) {
      console.log('[BOOKING] Booking conflict:', bookingResult.error);
      return { 
        success: false, 
        message: bookingResult.error || "Извините, стол только что забронировали. Попробуйте выбрать другое время."
      };
    }

    console.log('[BOOKING] Reservation created successfully:', bookingResult.data);

    revalidatePath('/admin');

    // 3. Send Telegram notification (fire and forget - never blocks the response)
    const notificationData: TelegramNotificationData = {
      phone,
      name,
      date,
      time,
      guests: guestsCount,
      expected_duration_minutes,
      tableName: tableDisplayName,
    };
    
    // Use Promise.then to make it truly fire-and-forget
    Promise.resolve().then(() => sendTelegramNotification(notificationData));

    // Return success to client immediately
    return { 
      success: true, 
      message: "Заявка отправлена. Ожидайте подтверждения!",
      booking: {
        name,
        date,
        time,
        tableName: tableDisplayName || "Любой свободный",
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[BOOKING] Unexpected error:", errorMessage);
    return { success: false, message: `Ошибка: ${errorMessage}` };
  }
}
