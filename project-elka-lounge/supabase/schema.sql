-- ELKA LOUNGE OPERATING PLATFORM
-- Database Schema

-- Guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_adult BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables table
CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'waitlist' CHECK (status IN ('waitlist', 'confirmed', 'seated', 'completed', 'cancelled')),
  expected_duration_minutes INTEGER DEFAULT 180,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_reservations_table_id ON reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_arrival_time ON reservations(arrival_time);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
