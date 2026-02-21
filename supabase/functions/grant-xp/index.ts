import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkBodySize, isValidUUID } from "../_shared/bodyLimit.ts";

// SECURITY FIX: CORS Whitelist - Replace wildcard with allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8081",
  "http://localhost:3000",
  "https://greenbuddy.app",
  "https://www.greenbuddy.app",
  "https://greenbuddy-plant.vercel.app",
  "https://staging.greenbuddy.com",
  "exp://localhost:8081",
];

// Function to get CORS headers based on request origin
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const isAllowed = allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, content-type, x-csrf-token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * P2.1 SECURITY FIX: Database-backed rate limiting
 * Replaces volatile in-memory Map with persistent rate_limit_logs table
 * Max 10 requests per minute per user per action
 */
async function checkAndLogRateLimit(
  supabaseAdmin: any,
  userId: string,
  action: string,
  endpoint: string
): Promise<boolean> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000).toISOString();
  
  try {
    // Query existing requests in the last minute
    const { data: existingLogs, error: queryError } = await supabaseAdmin
      .from("rate_limit_logs")
      .select("request_count")
      .eq("user_id", userId)
      .eq("action", action)
      .gte("window_start", oneMinuteAgo)
      .order("window_start", { ascending: false })
      .limit(1)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      console.error("Rate limit query error:", queryError);
      throw queryError;
    }

    // If we found existing log entry
    if (existingLogs && existingLogs.request_count >= 10) {
      return true; // Rate limited
    }

    // Insert new rate limit log
    const requestCount = existingLogs ? existingLogs.request_count + 1 : 1;
    const { error: insertError } = await supabaseAdmin
      .from("rate_limit_logs")
      .insert({
        user_id: userId,
        action,
        endpoint,
        request_count: requestCount,
        window_start: now.toISOString(),
      })
      .on("CONFLICT", {
        onConflict: "user_id, action, window_start",
        then: "UPDATE request_count = request_count + 1"
      });

    if (insertError && insertError.code !== "23505") {
      console.error("Rate limit insert error:", insertError);
      throw insertError;
    }

    return false; // Not rate limited
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open: if rate limiting fails, allow the request
    return false;
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // SECURITY: Reject oversized payloads (5MB max)
  const bodySizeError = checkBodySize(req, corsHeaders);
  if (bodySizeError) return bodySizeError;

  try {
    // P1.2: CSRF Token Validation - ENHANCED SECURITY FIX
    // Validate token against user session metadata
    const csrfToken = req.headers.get("x-csrf-token");
    if (!csrfToken) {
      return new Response(JSON.stringify({ error: "Missing CSRF token" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify JWT token first to get user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with service role for internal operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Verify the token and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY FIX: Validate CSRF token against user metadata
    const storedToken = user.user_metadata?.csrf_token;
    if (!storedToken || csrfToken !== storedToken) {
      return new Response(JSON.stringify({ error: "Invalid CSRF token - potential attack detected" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { plantId, xpAmount, action } = await req.json();

    // P1.3: Enhanced Input Validation
    // Validate plantId format (UUID v4)
    if (!plantId || typeof plantId !== 'string' || !isValidUUID(plantId)) {
      return new Response(JSON.stringify({ error: "Invalid plant ID format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: Verify plant belongs to authenticated user
    const { data: plantCheck, error: plantCheckError } = await supabaseAdmin
      .from("plants")
      .select("id")
      .eq("id", plantId)
      .eq("user_id", user.id)
      .single();

    if (plantCheckError || !plantCheck) {
      return new Response(JSON.stringify({ error: "Plant not found or access denied" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate xpAmount is a positive number
    if (typeof xpAmount !== 'number' || xpAmount <= 0 || !Number.isInteger(xpAmount)) {
      return new Response(JSON.stringify({ error: "Invalid XP amount format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate xpAmount range (max 100 per action)
    if (xpAmount > 100) {
      return new Response(JSON.stringify({ error: "XP amount exceeds maximum (100)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate action is a non-empty string
    if (!action || typeof action !== 'string' || action.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid action format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // P2.1 SECURITY FIX: Database-backed rate limiting check
    const isRateLimited = await checkAndLogRateLimit(
      supabaseAdmin,
      user.id,
      action,
      "grant-xp"
    );

    if (isRateLimited) {
      return new Response(JSON.stringify({ 
        error: "Rate limit exceeded",
        details: "Maximum 10 requests per minute per action type"
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // P1.4: Audit Logging
    const userIpAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const auditEntry = {
      user_id: user.id,
      action: "grant_xp",
      details: { plantId, xpAmount, action },
      ip_address: userIpAddress,
      timestamp: new Date().toISOString(),
    };

    // Log asynchronously (don't block the response)
    supabaseAdmin.from("mutation_audit_logs").insert(auditEntry).catch((err) => {
      console.error("Audit logging error:", err);
    });

    // REFACTOR (Feb 21): Use atomic RPC function instead of sequential writes
    // This ensures atomicity: either ALL writes succeed or ALL rollback
    // Prevents: Partial write (INSERT succeeds but UPDATE fails due to network timeout)
    // See: supabase/migrations/20260221_grant_xp_atomic_rpc.sql
    const { data: result, error: rpcError } = await supabaseAdmin.rpc('grant_xp_atomic', {
      p_user_id: user.id,
      p_xp_amount: xpAmount,
      p_action: action,
    });

    if (rpcError) {
      console.error("RPC error:", rpcError);
      throw rpcError;
    }

    if (!result?.success) {
      throw new Error(`XP grant failed: ${result?.error_message || 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        newXp: result.new_xp,
        newLevel: result.new_level,
        leveledUp: result.leveled_up,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

