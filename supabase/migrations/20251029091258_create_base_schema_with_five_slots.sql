/*
  # Create Lottery Database Schema with 5 Time Slots

  1. New Tables
    - `draws` - Store lottery draw results
      - `id` (uuid, primary key)
      - `date` (date)
      - `slot` (text) - 5 daily slots: 10:00, 12:00, 14:00, 17:00, 19:00
      - `draw_no` (text, unique)
      - `digit_1`, `digit_2`, `digit_3`, `digit_4`, `digit_5` (text) - 5 individual digits
      - `published` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `news_posts` - Store news articles
      - `id` (uuid, primary key)
      - `title` (text)
      - `body` (text)
      - `author` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `faqs` - Store frequently asked questions
      - `id` (uuid, primary key)
      - `question` (text)
      - `answer` (text)
      - `order_index` (integer)
    
    - `contact_messages` - Store contact form submissions
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text)
      - `message` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users (admin/editor access)
    - Public read access for published content
    
  3. Time Slots
    - 10:00 AM - Morning Draw
    - 12:00 PM - Noon Draw
    - 2:00 PM (14:00) - Afternoon Draw
    - 5:00 PM (17:00) - Evening Draw
    - 7:00 PM (19:00) - Night Draw
*/

-- Create draws table with 5-digit structure
CREATE TABLE IF NOT EXISTS draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  slot text NOT NULL CHECK (slot IN ('10:00', '12:00', '14:00', '17:00', '19:00')),
  draw_no text UNIQUE NOT NULL,
  digit_1 text NOT NULL CHECK (length(digit_1) = 1 AND digit_1 ~ '^[0-9]$'),
  digit_2 text NOT NULL CHECK (length(digit_2) = 1 AND digit_2 ~ '^[0-9]$'),
  digit_3 text NOT NULL CHECK (length(digit_3) = 1 AND digit_3 ~ '^[0-9]$'),
  digit_4 text NOT NULL CHECK (length(digit_4) = 1 AND digit_4 ~ '^[0-9]$'),
  digit_5 text NOT NULL CHECK (length(digit_5) = 1 AND digit_5 ~ '^[0-9]$'),
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create news_posts table
CREATE TABLE IF NOT EXISTS news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  author text NOT NULL DEFAULT 'Suvarna Chakram Department',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer NOT NULL DEFAULT 1
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policies for draws table
CREATE POLICY "Public can read published draws"
  ON draws
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Authenticated users can manage draws"
  ON draws
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for news_posts table
CREATE POLICY "Public can read news posts"
  ON news_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage news"
  ON news_posts
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for faqs table
CREATE POLICY "Public can read faqs"
  ON faqs
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage faqs"
  ON faqs
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for contact_messages table
CREATE POLICY "Users can insert contact messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete contact messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_draws_date_slot ON draws(date, slot);
CREATE INDEX IF NOT EXISTS idx_draws_published ON draws(published);
CREATE INDEX IF NOT EXISTS idx_draws_slot ON draws(slot);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON faqs(order_index);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contact_messages(created_at DESC);

-- Create draw statistics view
CREATE OR REPLACE VIEW draw_statistics AS
SELECT 
  date,
  COUNT(*) as total_draws,
  COUNT(CASE WHEN published = true THEN 1 END) as published_draws,
  COUNT(CASE WHEN slot = '10:00' THEN 1 END) as morning_draws,
  COUNT(CASE WHEN slot = '12:00' THEN 1 END) as noon_draws,
  COUNT(CASE WHEN slot = '14:00' THEN 1 END) as afternoon_draws,
  COUNT(CASE WHEN slot = '17:00' THEN 1 END) as evening_draws,
  COUNT(CASE WHEN slot = '19:00' THEN 1 END) as night_draws
FROM draws 
GROUP BY date
ORDER BY date DESC;

-- Grant access to the view
GRANT SELECT ON draw_statistics TO authenticated;
GRANT SELECT ON draw_statistics TO anon;

-- Insert sample data
INSERT INTO draws (date, slot, draw_no, digit_1, digit_2, digit_3, digit_4, digit_5, published) VALUES
  (CURRENT_DATE, '10:00', 'SC' || to_char(CURRENT_DATE, 'DDMMYYYY') || '1', '4', '5', '6', '7', '8', true),
  (CURRENT_DATE, '12:00', 'SC' || to_char(CURRENT_DATE, 'DDMMYYYY') || '2', '7', '8', '9', '0', '1', true),
  (CURRENT_DATE - INTERVAL '1 day', '10:00', 'SC' || to_char(CURRENT_DATE - INTERVAL '1 day', 'DDMMYYYY') || '1', '1', '2', '3', '4', '5', true),
  (CURRENT_DATE - INTERVAL '1 day', '12:00', 'SC' || to_char(CURRENT_DATE - INTERVAL '1 day', 'DDMMYYYY') || '2', '5', '6', '7', '8', '9', true);

INSERT INTO news_posts (title, body, author) VALUES
  ('Festival Season Special Draws Announced', 'In celebration of the upcoming festival season, additional special draws have been scheduled. Check the official schedule for updated timings and prize structures.', 'Suvarna Chakram Department'),
  ('System Maintenance Notice', 'Scheduled maintenance will be performed on our result publication system this weekend. Results may be delayed by up to 15 minutes during this period.', 'Technical Team'),
  ('Prize Claim Deadline Reminder', 'Winners are reminded that lottery prizes must be claimed within 30 days of the draw date. Please visit the nearest lottery office with your winning ticket and valid ID.', 'Suvarna Chakram Department');

INSERT INTO faqs (question, answer, order_index) VALUES
  ('How do I read the lottery results?', 'Each draw displays a 5-digit winning number. Match all 5 digits in exact order to win the jackpot. Additional prizes are available for partial matches.', 1),
  ('What are the daily draw timings?', 'There are five daily draws: 10:00 AM, 12:00 PM, 2:00 PM (14:00), 5:00 PM (17:00), and 7:00 PM (19:00) IST. Results are published within 15 minutes of each draw.', 2),
  ('How long do I have to claim my prize?', 'All lottery prizes must be claimed within 30 days of the draw date. After this period, prizes are forfeited.', 3),
  ('Where can I verify the official results?', 'Always verify results with official Suvarna Chakram sources. This website is for quick reference only and should not be considered the final authority.', 4),
  ('What documents do I need to claim a prize?', 'You need the original winning ticket and a valid government-issued photo ID. For prizes above ₹10,000, additional documentation may be required.', 5);