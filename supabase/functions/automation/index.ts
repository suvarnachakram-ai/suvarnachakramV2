import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function getISTDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 60 * 60 * 1000);
}

const AUTO_DRAW_CONFIG = {
  enabled: true,
  publishDelayMinutes: 15,
};

const TIME_SLOTS = ["10:00", "12:00", "14:00", "17:00", "19:00"];

function generateRandomDigits() {
  return {
    digit1: Math.floor(Math.random() * 10).toString(),
    digit2: Math.floor(Math.random() * 10).toString(),
    digit3: Math.floor(Math.random() * 10).toString(),
    digit4: Math.floor(Math.random() * 10).toString(),
    digit5: Math.floor(Math.random() * 10).toString(),
  };
}

function generateDrawNumber(date: string, slotIndex: number): string {
  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear().toString();
  return `SC${day}${month}${year}${slotIndex + 1}`;
}

function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(":").map(Number);
  const date = getISTDate();
  date.setHours(hours, mins + minutes, 0, 0);
  return date.toTimeString().slice(0, 5);
}

async function sendNotification(
  type: "pre_draw" | "result_published",
  slot: string,
  drawId?: string
): Promise<void> {
  try {
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-notifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ type, slot, drawId }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to send ${type} notification for ${slot}:`, error);
    } else {
      const result = await response.json();
      console.log(`Sent ${type} notification for ${slot}:`, result);
    }
  } catch (error) {
    console.error(`Error sending ${type} notification for ${slot}:`, error);
  }
}

async function checkAndSendPreDrawNotifications(): Promise<string> {
  const now = getISTDate();
  const currentTime = now.toTimeString().slice(0, 5);
  const today = now.toISOString().split("T")[0];

  let sentCount = 0;

  for (const slot of TIME_SLOTS) {
    const preDrawTime = addMinutesToTime(slot, -15);

    if (currentTime === preDrawTime) {
      const { data: draw } = await supabase
        .from("draws")
        .select("id")
        .eq("date", today)
        .eq("slot", slot)
        .maybeSingle();

      if (draw) {
        await sendNotification("pre_draw", slot, draw.id);
        sentCount++;
      }
    }
  }

  return sentCount > 0
    ? `🔔 Sent ${sentCount} pre-draw notification(s)`
    : "ℹ️ No pre-draw notifications to send";
}

async function createDailyDrafts(): Promise<string> {
  const date = getISTDate().toISOString().split("T")[0];
  const { data: existingDraws, error: checkError } = await supabase
    .from("draws")
    .select("id")
    .eq("date", date);

  if (checkError) throw checkError;
  if (existingDraws && existingDraws.length > 0) {
    return `✅ Drafts already exist for ${date}`;
  }

  const drafts = TIME_SLOTS.map((slot, index) => {
    const digits = generateRandomDigits();
    return {
      date,
      slot,
      draw_no: generateDrawNumber(date, index),
      digit_1: digits.digit1,
      digit_2: digits.digit2,
      digit_3: digits.digit3,
      digit_4: digits.digit4,
      digit_5: digits.digit5,
      published: false,
    };
  });

  const { error: insertError } = await supabase.from("draws").insert(drafts);
  if (insertError) throw insertError;

  return `🆕 Created ${drafts.length} drafts for ${date}`;
}

async function autoPublishResults(): Promise<string> {
  const now = getISTDate();
  const currentTime = now.toTimeString().slice(0, 5);
  const today = now.toISOString().split("T")[0];

  const { data: unpublishedDraws, error: fetchError } = await supabase
    .from("draws")
    .select("*")
    .eq("date", today)
    .eq("published", false);

  if (fetchError) throw fetchError;
  if (!unpublishedDraws || unpublishedDraws.length === 0) {
    return "ℹ️ No pending draws to publish.";
  }

  let publishedCount = 0;
  for (const draw of unpublishedDraws) {
    const publishTime = addMinutesToTime(
      draw.slot,
      AUTO_DRAW_CONFIG.publishDelayMinutes
    );

    if (currentTime >= publishTime) {
      const { error: updateError } = await supabase
        .from("draws")
        .update({
          published: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", draw.id);

      if (updateError) throw updateError;

      await sendNotification("result_published", draw.slot, draw.id);
      publishedCount++;
    }
  }

  return `✅ Published ${publishedCount} draws.`;
}

Deno.serve(async () => {
  try {
    const draftMsg = await createDailyDrafts();
    const publishMsg = await autoPublishResults();
    const notificationMsg = await checkAndSendPreDrawNotifications();

    return new Response(
      JSON.stringify({
        draftMsg,
        publishMsg,
        notificationMsg,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Automation error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
