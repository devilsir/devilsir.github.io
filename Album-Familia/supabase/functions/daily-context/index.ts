const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function saoPauloParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

Deno.serve((request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método inválido" }), { status: 405, headers: corsHeaders });
  }
  const now = new Date();
  const parts = saoPauloParts(now);
  const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
  const elapsedSeconds = Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second);
  const secondsToRotation = 86400 - elapsedSeconds;
  const nextRotationAt = new Date(now.getTime() + secondsToRotation * 1000).toISOString();
  return new Response(JSON.stringify({
    dateKey,
    timeZone: "America/Sao_Paulo",
    serverTime: now.toISOString(),
    nextRotationAt,
    rotatesInSeconds: secondsToRotation,
    validation: "submit-score-v2",
  }), { headers: corsHeaders });
});
