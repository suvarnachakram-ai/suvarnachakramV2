/*
  # Update slot constraint for 3 daily draws

  1. Changes
    - Drop existing slot check constraint
    - Add new constraint allowing only '12:00', '14:00', '17:00'
    - Clean up any existing data that doesn't match new constraint

  2. Security
    - Maintains existing RLS policies
*/

-- First, delete any existing draws that don't match our new 3-slot system
DELETE FROM draws WHERE slot NOT IN ('12:00', '14:00', '17:00');

-- Drop the existing constraint
ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_slot_check;

-- Add the new constraint for our 3-slot system
ALTER TABLE draws ADD CONSTRAINT draws_slot_check 
  CHECK (slot = ANY (ARRAY['12:00'::text, '14:00'::text, '17:00'::text]));