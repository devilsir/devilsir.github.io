import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const games = new Set(["numbers", "image", "memory", "snake", "tetris", "luxor", "simon", "lights"]);
const difficultyRanks: Record<string, number> = { facil: 1, normal: 2, dificil: 3, extremo: 4, inferno: 5 };
const baseTimes: Record<string, number> = { numbers: 90000, image: 110000, memory: 90000, snake: 75000, tetris: 150000, luxor: 180000, simon: 95000, lights: 85000 };
const difficultyMultipliers = [1, 1.35, 1.8, 2.45, 3.25];
const phaseMultipliers = [1, 1.18, 1.42];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function phasePoints(gameKey: string, difficultyKey: string, phase: number, elapsed: number) {
  const rank = difficultyRanks[difficultyKey];
  const target = baseTimes[gameKey] * (1 + (rank - 1) * 0.08) * (1 + (phase - 1) * 0.12);
  const base = Math.round(900 * difficultyMultipliers[rank - 1] * phaseMultipliers[phase - 1]);
  const speedRatio = clamp(1 - elapsed / target, 0, 0.65);
  return Math.max(1, base + Math.round(base * speedRatio) + 250 * rank * phase);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Método inválido" }, { status: 405, headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authorization = request.headers.get("Authorization") || "";

    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) return Response.json({ error: "Sessão inválida" }, { status: 401, headers: corsHeaders });

    const body = await request.json();
    const displayName = String(body.displayName || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 32);
    const gameKey = String(body.gameKey || "");
    const difficultyKey = String(body.difficultyKey || "");
    const durations = Array.isArray(body.phaseDurationsMs) ? body.phaseDurationsMs.map(Number) : [];

    if (!displayName || !games.has(gameKey) || !difficultyRanks[difficultyKey]) throw new Error("Dados inválidos");
    if (Number(body.phasesCompleted) !== 3 || durations.length !== 3) throw new Error("As três fases são obrigatórias");
    if (durations.some((duration) => !Number.isFinite(duration) || duration < 1500 || duration > 1800000)) throw new Error("Tempo de fase inválido");

    const points = durations.reduce((total, duration, index) => total + phasePoints(gameKey, difficultyKey, index + 1, duration), 0);
    const durationMs = Math.round(durations.reduce((total, duration) => total + duration, 0));
    const service = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await service.rpc("record_free_score", {
      p_user_id: user.id,
      p_display_name: displayName,
      p_game_key: gameKey,
      p_difficulty_key: difficultyKey,
      p_points: points,
      p_duration_ms: durationMs,
    });
    if (error) throw error;

    return Response.json({ points, durationMs }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Pontuação recusada" }, { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
