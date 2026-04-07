"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

    const { data: tables, error: tablesError } = await supabase
      .from("tables")
      .select("*")
      .eq("is_active", true)
      .order("number");

    if (tablesError) {
      return { tables: [], reservations: [], error: `Database error (tables): ${tablesError.message}` };
    }

    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select(`*, guest:guests (*)`)
      .gte("arrival_time", startOfDay)
      .in("status", ["waitlist", "confirmed", "seated"])
      .order("arrival_time");

    if (reservationsError) {
      return { tables: tables || [], reservations: [], error: `Database error (reservations): ${reservationsError.message}` };
    }

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

export async function updateReservationStatus(
  reservationId: string, 
  status: Reservation["status"]
): Promise<{ success: boolean; message: string }> {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return { success: false, message: "Missing environment variables" };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from("reservations")
      .update({ status })
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
