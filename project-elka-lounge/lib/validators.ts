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

const TZ = "Asia/Novosibirsk";

export function isOvernightBooking(dateStr: string, timeStr: string): boolean {
  const { hours } = getCurrentTimeInLocalTZ();
  const currentMinutes = hours * 60;
  const [h, m] = timeStr.split(":").map(Number);
  const selectedMinutes = h * 60 + m;
  return selectedMinutes < 360 && currentMinutes > 1080;
}

export function getEffectiveDate(dateStr: string, timeStr: string): string {
  if (isOvernightBooking(dateStr, timeStr)) {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString("en-CA", { timeZone: TZ });
  }
  return dateStr;
}

export function validateTimeNotPast(dateStr: string, timeStr: string): ValidationResult {
  const effectiveDate = getEffectiveDate(dateStr, timeStr);
  const arrivalISO = `${effectiveDate}T${timeStr}:00+07:00`;
  
  const arrivalMinutes = getMinutesFromMidnightLocalTZ(arrivalISO);
  if (arrivalMinutes === null) {
    return { valid: false, error: "Некорректное время прибытия" };
  }

  const { hours, minutes } = getCurrentTimeInLocalTZ();
  const nowMinutes = hours * 60 + minutes;

  const effectiveMins = isOvernightBooking(dateStr, timeStr) ? arrivalMinutes + 1440 : arrivalMinutes;

  if (effectiveMins < nowMinutes) {
    return { valid: false, error: "Нельзя бронировать на прошедшее время" };
  }

  return { valid: true };
}

export async function validateTableFree(
  tableId: string,
  dateStr: string,
  timeStr: string,
  durationMinutes: number,
  excludeReservationId?: string
): Promise<ValidationResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { valid: false, error: "Ошибка подключения к базе данных" };
  }

  const effectiveDate = getEffectiveDate(dateStr, timeStr);
  const isOvernight = isOvernightBooking(dateStr, timeStr);
  
  const arrivalISO = `${effectiveDate}T${timeStr}:00+07:00`;
  const arrivalMins = getMinutesFromMidnightLocalTZ(arrivalISO);
  if (arrivalMins === null) {
    return { valid: false, error: "Некорректное время прибытия" };
  }

  const endMins = arrivalMins + durationMinutes;

  const startOfDayUTC = new Date(effectiveDate + "T00:00:00+07:00").toISOString();
  const endOfDayUTC = new Date(effectiveDate + "T23:59:59+07:00").toISOString();

  let query = supabase
    .from("reservations")
    .select("id, arrival_time, expected_duration_minutes")
    .eq("table_id", tableId)
    .in("status", ["waitlist", "confirmed", "seated"])
    .gte("arrival_time", startOfDayUTC)
    .lte("arrival_time", endOfDayUTC);

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
    const checkArrival = isOvernight ? arrivalMins + 1440 : arrivalMins;
    const checkEnd = isOvernight ? endMins + 1440 : endMins;

    const overlaps = checkArrival < resEndMins && checkEnd > resArrivalMins;
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
