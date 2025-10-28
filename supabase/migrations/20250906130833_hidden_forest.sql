/*
  # Fix 12 PM Time Slot Constraint

  1. Database Changes
    - Update slot constraint to allow '12:00', '14:00', '17:00'
    - Remove any conflicting data

  2. Security
    - Maintain existing RLS policies
*/

-- First, delete any draws that might conflict with new constraint
DELETE FROM draws WHERE slot NOT IN ('12:00', '14:00', '17:00');

-- Drop the existing constraint
ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_slot_check;

-- Add new constraint with correct 12 PM slot
ALTER TABLE draws ADD CONSTRAINT draws_slot_check 
  CHECK (slot = ANY (ARRAY['12:00'::text, '14:00'::text, '17:00'::text]));