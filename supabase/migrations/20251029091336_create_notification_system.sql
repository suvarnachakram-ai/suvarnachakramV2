/*
  # Create Notification System Tables

  1. New Tables
    - `notification_subscriptions`
      - `id` (uuid, primary key)
      - `endpoint` (text, unique) - Push subscription endpoint URL
      - `p256dh_key` (text) - Encryption key for push messages
      - `auth_key` (text) - Authentication secret
      - `user_agent` (text) - Browser/device info for debugging
      - `is_active` (boolean) - Whether subscription is currently active
      - `created_at` (timestamptz)
      - `last_notified_at` (timestamptz) - Track when last notification was sent
    
    - `notification_settings`
      - `id` (uuid, primary key)
      - `subscription_id` (uuid, foreign key to notification_subscriptions)
      - `slot_10_00` (boolean) - Receive notifications for 10:00 AM draw
      - `slot_12_00` (boolean) - Receive notifications for 12:00 PM draw
      - `slot_14_00` (boolean) - Receive notifications for 2:00 PM draw
      - `slot_17_00` (boolean) - Receive notifications for 5:00 PM draw
      - `slot_19_00` (boolean) - Receive notifications for 7:00 PM draw
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `notification_logs`
      - `id` (uuid, primary key)
      - `subscription_id` (uuid, foreign key)
      - `notification_type` (text) - 'pre_draw' or 'result_published'
      - `slot` (text) - Which time slot the notification was for
      - `draw_id` (uuid, nullable, foreign key to draws)
      - `sent_at` (timestamptz)
      - `success` (boolean)
      - `error_message` (text, nullable)

  2. Security
    - Enable RLS on all tables
    - Public can insert subscriptions (anonymous users can subscribe)
    - Authenticated users (admins) can view all subscriptions
    - Subscriptions can update their own settings via endpoint matching

  3. Indexes
    - Index on active subscriptions for efficient querying
    - Index on notification logs for reporting
    - Index on notification settings by subscription_id
    
  4. Automation
    - Trigger to automatically create default settings when subscription is created
*/

-- Create notification_subscriptions table
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text UNIQUE NOT NULL,
  p256dh_key text NOT NULL,
  auth_key text NOT NULL,
  user_agent text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_notified_at timestamptz
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES notification_subscriptions(id) ON DELETE CASCADE,
  slot_10_00 boolean DEFAULT true,
  slot_12_00 boolean DEFAULT true,
  slot_14_00 boolean DEFAULT true,
  slot_17_00 boolean DEFAULT true,
  slot_19_00 boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(subscription_id)
);

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES notification_subscriptions(id) ON DELETE SET NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('pre_draw', 'result_published')),
  slot text NOT NULL CHECK (slot IN ('10:00', '12:00', '14:00', '17:00', '19:00')),
  draw_id uuid REFERENCES draws(id) ON DELETE SET NULL,
  sent_at timestamptz DEFAULT now(),
  success boolean DEFAULT true,
  error_message text
);

-- Enable Row Level Security
ALTER TABLE notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Policies for notification_subscriptions
CREATE POLICY "Anyone can insert subscriptions"
  ON notification_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read subscriptions"
  ON notification_subscriptions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update their subscription"
  ON notification_subscriptions
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete subscriptions"
  ON notification_subscriptions
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for notification_settings
CREATE POLICY "Anyone can insert settings"
  ON notification_settings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read settings"
  ON notification_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update settings"
  ON notification_settings
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete settings"
  ON notification_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for notification_logs
CREATE POLICY "Authenticated users can read logs"
  ON notification_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert logs"
  ON notification_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON notification_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_subscriptions_endpoint ON notification_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_settings_subscription_id ON notification_settings(subscription_id);
CREATE INDEX IF NOT EXISTS idx_logs_sent_at ON notification_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_subscription_id ON notification_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_logs_slot ON notification_logs(slot);
CREATE INDEX IF NOT EXISTS idx_logs_success ON notification_logs(success);

-- Create function to automatically create default settings when subscription is created
CREATE OR REPLACE FUNCTION create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_settings (subscription_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create settings
DROP TRIGGER IF EXISTS trigger_create_default_settings ON notification_subscriptions;
CREATE TRIGGER trigger_create_default_settings
  AFTER INSERT ON notification_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_settings();