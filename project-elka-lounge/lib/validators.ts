import { createClient } from "@supabase/supabase-js";
import { getMinutesFromMidnightLocalTZ, getCurrentTimeInLocalTZ } from "@/lib/datetime";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateTimeNotPast(arrivalTime: string): ValidationResult {
  const arrivalMinutes = getMinutesFromMidnightLocalTZ(arrivalTime);
  if (arrivalMinutes === null) {
    return { valid: false, error: "Некорректное время прибытия" };
  }

  const { hours, minutes } = getCurrentTimeInLocalTZ();
  const nowMinutes = hours * 60 + minutes;

  // Parse the date part to check if it's today
  const todayDateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Novosibirsk" });
  const arrivalDate = new Date(arrivalTime).toLocaleDateString("en-CA", { timeZone: "Asia/Novosibirsk" });
  const isToday = todayDateStr === arrivalDate;

  // For today's bookings: handle overnight logic
  // If current time is late night (>18:00) and selected time is early morning (<6:00),
  // this is a booking for the next day, so add 24 hours to arrival minutes
  if (isToday && arrivalMinutes < 360 && nowMinutes > 1080) {
    // Early morning (0-6am) selected while it's late evening (>18:00) = next day
    const adjustedArrivalMinutes = arrivalMinutes + 1440; // Add 24 hours
    if (adjustedArrivalMinutes < nowMinutes) {
      return { valid: false, error: "Нельзя бронировать на прошедшее время" };
    }
    return { valid: true };
  }

  // Normal case: if arrival time is in the past
  if (arrivalMinutes < nowMinutes) {
    return { valid: false, error: "Нельзя бронировать на прошедшее время" };
  }

  return { valid: true };
}

export async function validateTableFree(
  tableId: string,
  arrivalTime: string,
  durationMinutes: number,
  excludeReservationId?: string
): Promise<ValidationResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { valid: false, error: "Ошибка подключения к базе данных" };
  }

  const arrivalMins = getMinutesFromMidnightLocalTZ(arrivalTime);
  if (arrivalMins === null) {
    return { valid: false, error: "Некорректное время прибытия" };
  }

  const endMins = arrivalMins + durationMinutes;

  let query = supabase
    .from("reservations")
    .select("id, arrival_time, expected_duration_minutes")
    .eq("table_id", tableId)
    .in("status", ["pending", "seated"]);

  if (excludeReservationId) {
    query = query.neq("id", excludeReservationId);
  }

  const { data: conflicts, error } = await query;

  if (error) {
    return { valid: false, error: `Ошибка проверки стола: ${error.message}` };
  }

  if (!conflicts || conflicts.length === 0) {
    return { valid: true };
  }

  for (const res of conflicts) {
    const resArrivalMins = getMinutesFromMidnightLocalTZ(res.arrival_time);
    if (resArrivalMins === null) continue;

    const resEndMins = resArrivalMins + res.expected_duration_minutes;

    const overlaps = arrivalMins < resEndMins && endMins > resArrivalMins;
    if (overlaps) {
      return {
        valid: false,
        error: "Стол уже забронирован на это время. Выберите другое время или стол.",
      };
    }
  }

  return { valid: true };
}

export async function validatePhysicalTableState(
  tableId: string,
  reservationId?: string
): Promise<ValidationResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { valid: false, error: "Ошибка подключения к базе данных" };
  }

  let query = supabase
    .from("reservations")
    .select("id, guest:guests(name)")
    .eq("table_id", tableId)
    .eq("status", "seated");

  if (reservationId) {
    query = query.neq("id", reservationId);
  }

  const { data: sittingGuest, error } = await query.maybeSingle();

  if (error) {
    return { valid: false, error: `Ошибка проверки состояния стола: ${error.message}` };
  }

  if (sittingGuest) {
    const guestName = (sittingGuest.guest as { name?: string } | null)?.name ?? "неизвестный гость";
    return {
      valid: false,
      error: `Стол физически занят гостем "${guestName}". Сначала освободите стол!`,
    };
  }

  return { valid: true };
}

export async function validateReservationHasTable(
  reservationId: string
): Promise<ValidationResult & { tableId?: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { valid: false, error: "Ошибка подключения к базе данных" };
  }

  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("id, table_id")
    .eq("id", reservationId)
    .single();

  if (error || !reservation) {
    return { valid: false, error: "Бронь не найдена" };
  }

  if (!reservation.table_id) {
    return { valid: false, error: "У брони нет привязанного стола" };
  }

  return { valid: true, tableId: reservation.table_id };
}
