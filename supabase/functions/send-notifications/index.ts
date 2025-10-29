import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// VAPID Configuration
const VAPID_PUBLIC_KEY = "BPrcoQEm_bIOM06VSCyuiW4qEgeBDiA1tzWpm6zH8JRaUFxjhRzW4iB6kTbiJNHSefesqZbluFZvNinapwhU4qA";
const VAPID_PRIVATE_KEY = "QgsqTBIqbwc5zLVCwD8d9GpJmtXXqJuR36mQ9Et5uY8";
const VAPID_SUBJECT = "mailto:support@suvarnachakram.com";

interface NotificationPayload {
  type: "pre_draw" | "result_published";
  slot: string;
  drawNo?: string;
  digits?: string;
}

interface Subscription {
  id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}

// Helper: Send Web Push Notification
async function sendWebPushNotification(
  subscription: Subscription,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const { slot, type, drawNo, digits } = payload;
    
    // Format time for display
    const [hours, minutes] = slot.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const timeStr = `${displayHour}:${minutes} ${ampm}`;

    let title = "";
    let body = "";
    let icon = "/icon-192.png";
    let badge = "/badge-96.png";
    let tag = `${type}-${slot}`;

    if (type === "pre_draw") {
      title = `Drawing in 15 minutes!`;
      body = `${timeStr} draw starting soon. Good luck!`;
    } else {
      title = `Results Published!`;
      body = `${timeStr} draw results are now available. Tap to view.`;
      if (drawNo) {
        body += ` Draw #${drawNo}`;
      }
    }

    const notificationData = {
      title,
      body,
      icon,
      badge,
      tag,
      data: {
        url: `/results`,
        slot,
        type,
        drawNo,
        digits,
      },
      requireInteraction: type === "result_published",
      vibrate: [200, 100, 200],
    };

    // Use Web Push Protocol (simplified version)
    // In production, use a proper web-push library
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TTL": "86400",
      },
      body: JSON.stringify(notificationData),
    });

    if (response.ok || response.status === 201) {
      return { success: true };
    } else {
      const errorText = await response.text();
      return { success: false, error: `Push failed: ${response.status} ${errorText}` };
    }
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Helper: Get slot setting key
function getSlotSettingKey(slot: string): string {
  return `slot_${slot.replace(":", "_")}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse request body
    const { type, slot, drawId }: {
      type: "pre_draw" | "result_published";
      slot: string;
      drawId?: string;
    } = await req.json();

    if (!type || !slot) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, slot" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get draw info if provided
    let drawNo: string | undefined;
    let digits: string | undefined;
    if (drawId) {
      const { data: draw } = await supabase
        .from("draws")
        .select("draw_no, digit_1, digit_2, digit_3, digit_4, digit_5")
        .eq("id", drawId)
        .single();
      
      if (draw) {
        drawNo = draw.draw_no;
        digits = `${draw.digit_1}${draw.digit_2}${draw.digit_3}${draw.digit_4}${draw.digit_5}`;
      }
    }

    // Get slot setting key
    const slotKey = getSlotSettingKey(slot);

    // Get active subscriptions with settings for this slot
    const { data: subscriptions, error: fetchError } = await supabase
      .from("notification_subscriptions")
      .select(`
        id,
        endpoint,
        p256dh_key,
        auth_key,
        notification_settings(
          ${slotKey}
        )
      `)
      .eq("is_active", true);

    if (fetchError) {
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscriptions found", sent: 0 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Filter subscriptions that have this slot enabled
    const filteredSubscriptions = subscriptions.filter((sub: any) => {
      const settings = sub.notification_settings?.[0];
      return settings && settings[slotKey] === true;
    });

    // Send notifications to all active subscriptions
    const results = await Promise.allSettled(
      filteredSubscriptions.map(async (sub: any) => {
        const result = await sendWebPushNotification(sub as Subscription, {
          type,
          slot,
          drawNo,
          digits,
        });

        // Log the notification attempt
        await supabase.from("notification_logs").insert({
          subscription_id: sub.id,
          notification_type: type,
          slot,
          draw_id: drawId || null,
          success: result.success,
          error_message: result.error || null,
        });

        // Update last_notified_at if successful
        if (result.success) {
          await supabase
            .from("notification_subscriptions")
            .update({ last_notified_at: new Date().toISOString() })
            .eq("id", sub.id);
        } else {
          // Deactivate subscription if endpoint is gone (410 status)
          if (result.error?.includes("410")) {
            await supabase
              .from("notification_subscriptions")
              .update({ is_active: false })
              .eq("id", sub.id);
          }
        }

        return result;
      })
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failureCount = results.filter(
      (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
    ).length;

    return new Response(
      JSON.stringify({
        message: "Notifications sent",
        total: filteredSubscriptions.length,
        successful: successCount,
        failed: failureCount,
        type,
        slot,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending notifications:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
