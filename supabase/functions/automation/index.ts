// supabase/functions/automation/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// ✅ Supabase client (service role key needed for writes)
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
// ✅ Utility: Indian Standard Time (UTC +5:30)
function getISTDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 60 * 60 * 1000);
}
// ✅ Configuration
const AUTO_DRAW_CONFIG = {
  enabled: true,
  publishDelayMinutes: 15 // Publish 15 min after each draw slot
};
// ✅ Daily draw time slots (IST)
const TIME_SLOTS = [
  "10:00",
  "12:00",
  "14:00",
  "17:00",
  "19:00"
];
// ✅ Utility: random 5 digits
function generateRandomDigits() {
  return {
    digit1: Math.floor(Math.random() * 10).toString(),
    digit2: Math.floor(Math.random() * 10).toString(),
    digit3: Math.floor(Math.random() * 10).toString(),
    digit4: Math.floor(Math.random() * 10).toString(),
    digit5: Math.floor(Math.random() * 10).toString()
  };
}
// ✅ Utility: generate draw number (SC + DDMMYYYY + slot number)
function generateDrawNumber(date, slotIndex) {
  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear().toString();
  return `SC${day}${month}${year}${slotIndex + 1}`;
}
// ✅ Utility: add minutes to a time string
function addMinutesToTime(timeStr, minutes) {
  const [hours, mins] = timeStr.split(":").map(Number);
  const date = getISTDate();
  date.setHours(hours, mins + minutes, 0, 0);
  return date.toTimeString().slice(0, 5);
}
// ✅ Step 1: Create daily draft draws (if not already created)
async function createDailyDrafts() {
  const date = getISTDate().toISOString().split("T")[0];
  const { data: existingDraws, error: checkError } = await supabase.from("draws").select("id").eq("date", date);
  if (checkError) throw checkError;
  if (existingDraws && existingDraws.length > 0) return `✅ Drafts already exist for ${date}`;
  const drafts = TIME_SLOTS.map((slot, index)=>{
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
      published: false
    };
  });
  const { error: insertError } = await supabase.from("draws").insert(drafts);
  if (insertError) throw insertError;
  return `🆕 Created ${drafts.length} drafts for ${date}`;
}
// ✅ Step 2: Auto-publish results after the configured delay
async function autoPublishResults() {
  const now = getISTDate();
  const currentTime = now.toTimeString().slice(0, 5);
  const today = now.toISOString().split("T")[0];
  const { data: unpublishedDraws, error: fetchError } = await supabase.from("draws").select("*").eq("date", today).eq("published", false);
  if (fetchError) throw fetchError;
  if (!unpublishedDraws || unpublishedDraws.length === 0) return "ℹ️ No pending draws to publish.";
  let publishedCount = 0;
  for (const draw of unpublishedDraws){
    const publishTime = addMinutesToTime(draw.slot, AUTO_DRAW_CONFIG.publishDelayMinutes);
    if (currentTime >= publishTime) {
      const { error: updateError } = await supabase.from("draws").update({
        published: true,
        updated_at: new Date().toISOString()
      }).eq("id", draw.id);
      if (updateError) throw updateError;
      publishedCount++;
    }
  }
  return `✅ Published ${publishedCount} draws.`;
}
// ✅ Entrypoint for scheduled/cron trigger
Deno.serve(async ()=>{
  try {
    const draftMsg = await createDailyDrafts();
    const publishMsg = await autoPublishResults();
    return new Response(JSON.stringify({
      draftMsg,
      publishMsg
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: String(err)
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});
