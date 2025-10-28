/*
  # Update Draw Timing System

  1. Schema Updates
    - Update slot constraint to match new timing system
    - Add draw count tracking
    - Update existing data to new timing format

  2. Data Migration
    - Convert old timing slots to new format
    - Update any existing draws with correct timing

  3. Security
    - Maintain existing RLS policies
    - Ensure data integrity
*/

-- Update the slot constraint to match new timing system
ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_slot_check;
ALTER TABLE draws ADD CONSTRAINT draws_slot_check 
  CHECK (slot = ANY (ARRAY['12:00'::text, '14:00'::text, '17:00'::text]));

-- Update any existing draws with old timing format to new format
UPDATE draws 
SET slot = CASE 
  WHEN slot = '10:30' THEN '12:00'
  WHEN slot = '12:30' THEN '14:00'
  WHEN slot = '19:00' THEN '17:00'
  ELSE slot
END
WHERE slot IN ('10:30', '12:30', '19:00');

-- Add index for better performance on slot queries
CREATE INDEX IF NOT EXISTS idx_draws_slot ON draws(slot);

-- Create a view for draw statistics
CREATE OR REPLACE VIEW draw_statistics AS
SELECT 
  date,
  COUNT(*) as total_draws,
  COUNT(CASE WHEN published = true THEN 1 END) as published_draws,
  COUNT(CASE WHEN slot = '12:00' THEN 1 END) as noon_draws,
  COUNT(CASE WHEN slot = '14:00' THEN 1 END) as afternoon_draws,
  COUNT(CASE WHEN slot = '17:00' THEN 1 END) as evening_draws
FROM draws 
GROUP BY date
ORDER BY date DESC;

-- Grant access to the view
GRANT SELECT ON draw_statistics TO authenticated;
GRANT SELECT ON draw_statistics TO anon;