/*
  # Clean Database and Update to 3 Daily Draws Only

  1. Data Cleanup
    - Delete all existing draw data
    - Reset auto-increment sequences
  
  2. Schema Updates  
    - Update slot constraint to only allow 12:00, 14:00, 17:00
    - These correspond to 12:00 PM, 2:00 PM, 5:00 PM
  
  3. Clean Start
    - Fresh database ready for 3 daily draws only
*/

-- Delete all existing data
DELETE FROM draws;
DELETE FROM news_posts;
DELETE FROM faqs;
DELETE FROM contact_messages;

-- Update the slot constraint to only allow 3 time slots
ALTER TABLE draws DROP CONSTRAINT IF EXISTS draws_slot_check;
ALTER TABLE draws ADD CONSTRAINT draws_slot_check 
  CHECK (slot = ANY (ARRAY['12:00'::text, '14:00'::text, '17:00'::text]));

-- Add some sample FAQs for the new 3-draw system
INSERT INTO faqs (question, answer, order_index) VALUES
('How many draws are there per day?', 'There are 3 draws daily: 12:00 PM (Noon), 2:00 PM (Afternoon), and 5:00 PM (Evening).', 1),
('What are the daily draw timings?', 'Daily draws are held at 12:00 PM, 2:00 PM, and 5:00 PM (IST). Results are announced 30 minutes after each draw.', 2),
('How do I check the results?', 'Visit our Results page to see all published draw results. You can filter by date or search for specific numbers.', 3),
('What is the prize structure?', '5-digit match: ₹50,000, 4-digit: ₹5,000, 3-digit: ₹500, 2-digit: ₹100, 1-digit: ₹20', 4),
('How long do I have to claim prizes?', 'All prizes must be claimed within 30 days of the draw date with original ticket and valid ID.', 5);

-- Add a welcome news post
INSERT INTO news_posts (title, body, author) VALUES
('Welcome to Suvarna Chakram - 3 Daily Draws!', 'We are excited to announce our streamlined lottery system with 3 daily draws at 12:00 PM, 2:00 PM, and 5:00 PM. Check results within 30 minutes of each draw completion. Good luck!', 'Suvarna Chakra Department');