-- Enable pg_cron if not already
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a job to trigger the automation Edge Function every 5 minutes
SELECT
  cron.schedule(
    'auto_draw_every_5_minutes',       -- unique job name
    '*/5 * * * *',                     -- cron expression (every 5 minutes)
    $$
    -- Make POST request to Supabase Edge Function "automation"
    SELECT
      net.http_post(
        url := 'https://yotuqjrzepxkygbloepy.supabase.co/functions/v1/dynamic-handler',
        headers := jsonb_build_object(
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdHVxanJ6ZXB4a3lnYmxvZXB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3MTg5NywiZXhwIjoyMDc3MTQ3ODk3fQ.AbdYhL8sllgflrhj6h8q188FFbFwtMz1uEHxTLesX-E',
          'Content-Type', 'application/json'
        ),
        body := '{}'
      );
    $$
  );
