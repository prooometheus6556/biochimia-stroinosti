"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export interface Table {
  id: string;
  number: number;
  capacity: number;
  features: string[];
  is_active: boolean;
}

export interface Guest {
  id: string;
  phone: string;
  name: string;
  created_at: string;
  is_adult: boolean;
}

export interface Reservation {
  id: string;
  guest_id: string;
  table_id: string | null;
  status: "waitlist" | "confirmed" | "seated" | "completed" | "cancelled";
  expected_duration_minutes: number;
  arrival_time: string;
  created_at: string;
  guest?: Guest;
}

export interface AdminData {
  tables: Table[];
  reservations: Reservation[];
  error: string | null;
}

export async function getAdminData(): Promise<AdminData> {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return { tables: [], reservations: [], error: "Missing Supabase environment variables" };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const novosibirskOffsetHours = 7;
    const localOffset = now.getTimezoneOffset();
    const localTime = new Date(now.getTime() + (novosibirskOffsetHours * 60 + localOffset) * 60000);
    const startOfDayLocal = new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate());
    const startOfDayUTC = startOfDayLocal.toISOString();

    console.log("[ADMIN] Current time (UTC):", now.toISOString());
    console.log("[ADMIN] Start of day (Novosibirsk UTC+7):", startOfDayLocal.toISOString(), "→ UTC:", startOfDayUTC);

    const { data: tables, error: tablesError } = await supabase
      .from("tables")
      .select("*")
      .eq("is_active", true)
      .order("number");

    if (tablesError) {
      return { tables: [], reservations: [], error: `Database error (tables): ${tablesError.message}` };
    }

    console.log("[ADMIN] Tables loaded:", tables?.length);

    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select(`*, guest:guests (*)`)
      .gte("arrival_time", startOfDayUTC)
      .in("status", ["waitlist", "confirmed", "seated"])
      .order("arrival_time");

    if (reservationsError) {
      return { tables: tables || [], reservations: [], error: `Database error (reservations): ${reservationsError.message}` };
    }

    console.log("[ADMIN] Reservations loaded:", reservations?.length, "for date:", startOfDayUTC);

    return {
      tables: (tables as Table[]) || [],
      reservations: (reservations as Reservation[]) || [],
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { tables: [], reservations: [], error: `Unexpected error: ${errorMessage}` };
  }
}

export async function seatGuest(reservationId: string, tableId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, message: "Missing environment variables" };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from("reservations")
      .update({ status: "seated", table_id: tableId })
      .eq("id", reservationId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    return { success: true, message: "Гость успешно посажен" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: errorMessage };
  }
}

export async function freeTable(reservationId: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, message: "Missing environment variables" };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from("reservations")
      .update({ status: "completed", table_id: null })
      .eq("id", reservationId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    return { success: true, message: "Стол освобождён" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: errorMessage };
  }
}

function toLocalISOStringWithOffset(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00+07:00`;
}

async function sendAdminTelegramNotification(params: {
  tableIds: string[];
  name: string;
  phone: string;
  date: string;
  time: string;
  durationMinutes: number;
  isBlock: boolean;
  tables: { id: string; number: number }[];
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const tableNames = params.tableIds
    .map((id) => params.tables.find((t) => t.id === id)?.number ?? "?")
    .map((n) => `Стол ${n}`)
    .join(", ");

  const blockLabel = params.isBlock ? "\n⚠️ *Блокировка стола*" : "";

  const message = `${params.isBlock ? "⚠️ *Блокировка стола*" : "📋 *Бронь (админ)"}*

👤 Гость: *${params.name}*
📞 Телефон: ${params.phone}
📅 Дата: ${params.date}
🕐 Время: ${params.time}
⏱ Длительность: ${params.durationMinutes} мин
🪑 Стол: ${tableNames}${blockLabel}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" }),
    });
  } catch (e) {
    console.error("[TELEGRAM] Admin notification failed:", e);
  }
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

interface SafeBookingResult {
  success: boolean;
  data?: { id: string; guest_id: string; table_id: string; arrival_time: string };
  error?: string;
}

export interface AdminReservationData {
  tableIds: string[];
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  durationMinutes: number;
}

export async function createAdminReservation(data: AdminReservationData): Promise<{ success: boolean; message: string }> {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, message: "Missing environment variables" };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { tableIds, name, phone, date, time, guests, durationMinutes } = data;

    const { data: tablesInfo } = await supabase
      .from("tables")
      .select("id, number")
      .in("id", tableIds);

    if (!tableIds.length) {
      return { success: false, message: "Выберите хотя бы один стол" };
    }

    if (!name.trim()) {
      return { success: false, message: "Введите имя гостя" };
    }

    if (!date || !time) {
      return { success: false, message: "Не указаны дата или время" };
    }

    const isBlock = name.trim().toUpperCase().startsWith("БЛОК:");

    const results = await Promise.all(
      tableIds.map((tableId) => {
        if (!isValidUUID(tableId)) {
          return Promise.resolve({ success: false, error: "Invalid table ID" });
        }
        console.log("[ADMIN_BOOKING] Отправка в RPC:", {
          p_table_id: tableId,
          p_arrival_time: toLocalISOStringWithOffset(date, time),
          p_expected_duration_minutes: durationMinutes,
          p_guest_name: name.trim(),
          p_guest_phone: phone,
          p_guests_count: guests,
        });
        return supabase.rpc("book_table_safe", {
          p_table_id: tableId,
          p_arrival_time: toLocalISOStringWithOffset(date, time),
          p_expected_duration_minutes: durationMinutes,
          p_guest_name: name.trim(),
          p_guest_phone: phone,
          p_guests_count: guests,
        });
      })
    );

    for (let i = 0; i < results.length; i++) {
      const rpcResult = results[i] as {
        data?: SafeBookingResult | null;
        error?: { code: string; message: string; details: string } | null;
      };

      if (rpcResult.error) {
        console.error("[ADMIN_BOOKING] RPC system error:", rpcResult.error);
        return {
          success: false,
          message: `Системная ошибка БД: ${rpcResult.error.message || "неизвестно"}`,
        };
      }

      const data = rpcResult.data;
      if (!data || !data.success) {
        console.log("[ADMIN_BOOKING] RPC business error:", data?.error);
        return {
          success: false,
          message: data?.error || "Стол уже занят на это время",
        };
      }
    }

    if (isBlock) {
      for (const rpcResult of results as { data?: { id: string } }[]) {
        if (rpcResult.data?.id) {
          await supabase
            .from("reservations")
            .update({ status: "confirmed" })
            .eq("id", rpcResult.data.id);
        }
      }
    }

    revalidatePath("/admin");

    Promise.resolve().then(() =>
      sendAdminTelegramNotification({
        tableIds,
        name: name.trim(),
        phone,
        date,
        time,
        durationMinutes,
        isBlock,
        tables: (tablesInfo ?? []) as { id: string; number: number }[],
      })
    );

    const tableWord = tableIds.length === 1 ? "стол" : tableIds.length < 5 ? "стола" : "столов";
    return {
      success: true,
      message: `Забронировано ${tableIds.length} ${tableWord}${isBlock ? " (блокировка)" : ""}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Ошибка: ${errorMessage}` };
  }
}

const NOVOSIBIRSK_OFFSET_HOURS = 7;

function parseArrivalTimeMinutes(isoString: string | null | undefined): number | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    const localTs = d.getTime() + (NOVOSIBIRSK_OFFSET_HOURS * 3600000);
    const localDate = new Date(localTs);
    return localDate.getHours() * 60 + localDate.getMinutes();
  } catch {
    return null;
  }
}

export async function updateReservationStatus(
  reservationId: string,
  newStatus: Reservation["status"],
  endEarly: boolean = false
): Promise<{ success: boolean; message: string }> {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, message: "Missing environment variables" };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const updateData: Record<string, unknown> = { status: newStatus };

    if (endEarly) {
      const { data: reservation } = await supabase
        .from("reservations")
        .select("arrival_time, expected_duration_minutes")
        .eq("id", reservationId)
        .single();

      if (reservation?.arrival_time) {
        const arrivalMinutes = parseArrivalTimeMinutes(reservation.arrival_time);
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const actualMinutes = arrivalMinutes !== null ? nowMinutes - arrivalMinutes : reservation.expected_duration_minutes;
        updateData.expected_duration_minutes = Math.max(30, actualMinutes);
        console.log(`[UPDATE_STATUS] Early end: actual=${actualMinutes}min, arrival=${arrivalMinutes}, now=${nowMinutes}`);
      }
    }

    const { error } = await supabase
      .from("reservations")
      .update(updateData)
      .eq("id", reservationId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    return { success: true, message: "Статус обновлен" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: errorMessage };
  }
}
