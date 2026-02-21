/**
 * Shared body size limit utility for Edge Functions
 * Prevents DoS attacks via oversized payloads
 */

const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Check if request body exceeds max size.
 * Returns a 413 Response if too large, null otherwise.
 */
export function checkBodySize(
  req: Request,
  corsHeaders: Record<string, string>,
  maxBytes: number = MAX_BODY_SIZE
): Response | null {
  const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
  if (contentLength > maxBytes) {
    return new Response(
      JSON.stringify({ error: `Payload too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)` }),
      { status: 413, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
  return null;
}

/**
 * UUID v4 format validator
 */
export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}
