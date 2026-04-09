"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  price: number;
  is_available: boolean;
}

export async function getMenu(): Promise<MenuItem[]> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("category")
      .order("name");

    if (error) {
      console.error("Menu fetch error:", error);
      return [];
    }

    return (data as MenuItem[]) || [];
  } catch (error) {
    console.error("Menu error:", error);
    return [];
  }
}

export async function toggleMenuItemAvailability(
  itemId: string, 
  currentStatus: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !currentStatus })
      .eq("id", itemId);

    if (error) {
      console.error("DB update error:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/menu", "page");
    revalidatePath("/admin", "page");
    
    return { success: true, message: "Статус обновлен" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Toggle availability error:", errorMessage);
    return { success: false, message: errorMessage };
  }
}
