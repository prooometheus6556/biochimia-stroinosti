export interface Guest {
  id: string;
  phone: string;
  name: string;
  created_at: string;
  is_adult: boolean;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  features: string[];
  is_active: boolean;
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

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  price: number;
  is_available: boolean;
}
