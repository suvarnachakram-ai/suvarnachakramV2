/*
  # Update draws table to 5-digit structure

  1. Schema Changes
    - Remove `three_digit`, `two_digit`, `one_digit` columns
    - Add `digit_1`, `digit_2`, `digit_3`, `digit_4`, `digit_5` columns
    - Each digit is a single character (0-9)

  2. Data Migration
    - Convert existing data to new format
    - Preserve all existing results

  3. Constraints
    - Each digit must be exactly 1 character
    - Each digit must be numeric (0-9)
*/

-- Add new digit columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'draws' AND column_name = 'digit_1'
  ) THEN
    ALTER TABLE draws ADD COLUMN digit_1 text;
    ALTER TABLE draws ADD COLUMN digit_2 text;
    ALTER TABLE draws ADD COLUMN digit_3 text;
    ALTER TABLE draws ADD COLUMN digit_4 text;
    ALTER TABLE draws ADD COLUMN digit_5 text;
  END IF;
END $$;

-- Migrate existing data from old format to new format
UPDATE draws 
SET 
  digit_1 = SUBSTRING(three_digit, 1, 1),
  digit_2 = SUBSTRING(three_digit, 2, 1),
  digit_3 = SUBSTRING(three_digit, 3, 1),
  digit_4 = SUBSTRING(two_digit, 1, 1),
  digit_5 = SUBSTRING(two_digit, 2, 1)
WHERE digit_1 IS NULL;

-- Make new columns NOT NULL after migration
ALTER TABLE draws ALTER COLUMN digit_1 SET NOT NULL;
ALTER TABLE draws ALTER COLUMN digit_2 SET NOT NULL;
ALTER TABLE draws ALTER COLUMN digit_3 SET NOT NULL;
ALTER TABLE draws ALTER COLUMN digit_4 SET NOT NULL;
ALTER TABLE draws ALTER COLUMN digit_5 SET NOT NULL;

-- Add constraints for new digit columns
ALTER TABLE draws ADD CONSTRAINT draws_digit_1_check 
  CHECK (length(digit_1) = 1 AND digit_1 ~ '^[0-9]$');
ALTER TABLE draws ADD CONSTRAINT draws_digit_2_check 
  CHECK (length(digit_2) = 1 AND digit_2 ~ '^[0-9]$');
ALTER TABLE draws ADD CONSTRAINT draws_digit_3_check 
  CHECK (length(digit_3) = 1 AND digit_3 ~ '^[0-9]$');
ALTER TABLE draws ADD CONSTRAINT draws_digit_4_check 
  CHECK (length(digit_4) = 1 AND digit_4 ~ '^[0-9]$');
ALTER TABLE draws ADD CONSTRAINT draws_digit_5_check 
  CHECK (length(digit_5) = 1 AND digit_5 ~ '^[0-9]$');

-- Remove old constraints
ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_three_digit_check;
ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_two_digit_check;
ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_one_digit_check;

-- Remove old columns (after ensuring data is migrated)
ALTER TABLE draws DROP COLUMN IF EXISTS three_digit;
ALTER TABLE draws DROP COLUMN IF EXISTS two_digit;
ALTER TABLE draws DROP COLUMN IF EXISTS one_digit;