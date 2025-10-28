/*
  # Create Lottery Database Schema

  1. New Tables
    - `draws` - Store lottery draw results
      - `id` (uuid, primary key)
      - `date` (date)
      - `slot` (text)
      - `draw_no` (text, unique)
      - `three_digit` (text)
      - `two_digit` (text)
      - `one_digit` (text)
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
*/

-- Create draws table
CREATE TABLE IF NOT EXISTS draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  slot text NOT NULL CHECK (slot IN ('10:30', '12:30', '14:00', '17:00', '19:00')),
  draw_no text UNIQUE NOT NULL,
  three_digit text NOT NULL CHECK (length(three_digit) = 3 AND three_digit ~ '^[0-9]+$'),
  two_digit text NOT NULL CHECK (length(two_digit) = 2 AND two_digit ~ '^[0-9]+$'),
  one_digit text NOT NULL CHECK (length(one_digit) = 1 AND one_digit ~ '^[0-9]+$'),
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create news_posts table
CREATE TABLE IF NOT EXISTS news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  author text NOT NULL DEFAULT 'Swarna Chakra Department',
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
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON faqs(order_index);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contact_messages(created_at DESC);

-- Insert sample data
INSERT INTO draws (date, slot, draw_no, three_digit, two_digit, one_digit, published) VALUES
  (CURRENT_DATE, '10:30', 'SC' || to_char(CURRENT_DATE, 'DDMM') || '1', '456', '56', '6', true),
  (CURRENT_DATE, '12:30', 'SC' || to_char(CURRENT_DATE, 'DDMM') || '2', '789', '89', '9', true),
  (CURRENT_DATE - INTERVAL '1 day', '10:30', 'SC' || to_char(CURRENT_DATE - INTERVAL '1 day', 'DDMM') || '1', '123', '23', '3', true),
  (CURRENT_DATE - INTERVAL '1 day', '12:30', 'SC' || to_char(CURRENT_DATE - INTERVAL '1 day', 'DDMM') || '2', '567', '67', '7', true);

INSERT INTO news_posts (title, body, author) VALUES
  ('Festival Season Special Draws Announced', 'In celebration of the upcoming festival season, additional special draws have been scheduled. Check the official schedule for updated timings and prize structures.', 'Swarna Chakra Department'),
  ('System Maintenance Notice', 'Scheduled maintenance will be performed on our result publication system this weekend. Results may be delayed by up to 15 minutes during this period.', 'Technical Team'),
  ('Prize Claim Deadline Reminder', 'Winners are reminded that lottery prizes must be claimed within 30 days of the draw date. Please visit the nearest lottery office with your winning ticket and valid ID.', 'Swarna Chakra Department');

INSERT INTO faqs (question, answer, order_index) VALUES
  ('How do I read the lottery results?', 'Each draw has three numbers: 3-digit (₹27,000 prize), 2-digit (₹1,000 prize), and 1-digit (₹100 prize). Match all digits in exact order to win.', 1),
  ('What are the daily draw timings?', 'There are five daily draws: 10:30 AM, 12:30 PM, 02:00 PM, 05:00 PM, and 07:00 PM (IST). Results are published within 15 minutes of each draw.', 2),
  ('How long do I have to claim my prize?', 'All lottery prizes must be claimed within 30 days of the draw date. After this period, prizes are forfeited.', 3),
  ('Where can I verify the official results?', 'Always verify results with official Swarna Chakra sources. This website is for quick reference only and should not be considered the final authority.', 4),
  ('What documents do I need to claim a prize?', 'You need the original winning ticket and a valid government-issued photo ID. For prizes above ₹10,000, additional documentation may be required.', 5);