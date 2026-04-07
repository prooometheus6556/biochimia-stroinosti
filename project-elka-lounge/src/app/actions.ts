"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface BookingData {
  phone: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  tableId: string;
  expected_duration_minutes: number;
}

export async function createReservation(data: BookingData) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { phone, name, date, time, expected_duration_minutes } = data;

    const { data: existingGuest, error: guestError } = await supabase
      .from("guests")
      .select("id, name")
      .eq("phone", phone)
      .single();

    if (guestError && guestError.code !== "PGRST116") {
      return { success: false, message: `Ошибка поиска гостя: ${guestError.message}` };
    }

    let guestId: string;

    if (existingGuest) {
      guestId = existingGuest.id;
      
      if (name && name !== existingGuest.name) {
        const { error: updateError } = await supabase
          .from("guests")
          .update({ name })
          .eq("id", guestId);
        
        if (updateError) {
          return { success: false, message: `Ошибка обновления гостя: ${updateError.message}` };
        }
      }
    } else {
      const { data: newGuest, error: createGuestError } = await supabase
        .from("guests")
        .insert({ phone, name, is_adult: true })
        .select("id")
        .single();

      if (createGuestError) {
        return { success: false, message: `Ошибка создания гостя: ${createGuestError.message}` };
      }
      guestId = newGuest.id;
    }

    const arrivalTime = new Date(`${date}T${time}:00`).toISOString();

    const { error: reservationError } = await supabase
      .from("reservations")
      .insert({
        guest_id: guestId,
        status: "waitlist",
        expected_duration_minutes: expected_duration_minutes,
        arrival_time: arrivalTime,
      });

    if (reservationError) {
      return { success: false, message: `Ошибка создания бронирования: ${reservationError.message}` };
    }

    return { success: true, message: "Заявка отправлена. Ожидайте подтверждения!" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Booking error:", errorMessage);
    return { success: false, message: `Ошибка: ${errorMessage}` };
  }
}
