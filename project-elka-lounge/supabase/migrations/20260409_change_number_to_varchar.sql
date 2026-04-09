-- Migration: Change table number column from INTEGER to VARCHAR
-- This allows storing display names like "11.5" directly in the database.
-- After this migration, the frontend DISPLAY_NUMBER_MAP can be removed.
-- Run in Supabase SQL Editor.

-- Step 1: Change column type from INTEGER to VARCHAR(10)
ALTER TABLE tables ALTER COLUMN number TYPE VARCHAR(10);

-- Step 2: Update the table that was temporarily stored as number=13 → "11.5"
UPDATE tables SET number = '11.5' WHERE id = 'e8022b8b-b7d1-412f-9b93-2462b7500eb8';

-- Step 3: Fix capacity for "11.5" (was 4, should be 2)
UPDATE tables SET capacity = 2 WHERE number = '11.5';

-- Verify
SELECT id, number, capacity FROM tables ORDER BY (number::text);
