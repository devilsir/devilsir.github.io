import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const games = ["numbers", "image", "memory", "snake", "tetris", "luxor", "simon", "lights"] as const;
const gameSet = new Set<string>(games);
const difficulties = ["facil", "normal", "dificil", "extremo", "inferno"] as const;
const difficultyRanks: Record<string, number> = { facil: 1, normal: 2, dificil: 3, extremo: 4, inferno: 5 };
const baseTimes: Record<string, number> = { numbers: 90000, image: 110000, memory: 90000, snake: 75000, tetris: 150000, luxor: 180000, simon: 95000, lights: 85000 };
const difficultyMultipliers = [1, 1.35, 1.8, 2.45, 3.25];
const phaseMultipliers = [1, 1.08, 1.17, 1.27, 1.38, 1.5, 1.63, 1.77, 1.92, 2.08];
const dailySlots = ["featured", "quick", "mastery"] as const;
const dailyDetails = {
  featured: { ranks: [2, 3, 4], phases: [3, 8], reward: 3 },
  quick: { ranks: [1, 2, 3], phases: [1, 4], reward: 2 },
  mastery: { ranks: [4, 5], phases: [7, 10], reward: 5 },
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const integer = (value: unknown, min: number, max: number) => clamp(Math.round(Number(value) || 0), min, max);
const cleanName = (value: unknown) => String(value || "")
  .replace(/[\u0000-\u001f\u007f]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, 32);

function hash32(value: unknown) {
  let hash = 2166136261;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash += hash << 13;
  hash ^= hash >>> 7;
  hash += hash << 3;
  hash ^= hash >>> 17;
  hash += hash << 5;
  return hash >>> 0;
}

function seededRandom(seed: unknown) {
  let state = typeof seed === "number" ? seed >>> 0 : hash32(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(values: readonly T[], seed: unknown) {
  const result = [...values];
  const random = seededRandom(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function saoPauloDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dateDistanceDays(from: string, to: string) {
  const first = new Date(`${from}T12:00:00Z`).getTime();
  const second = new Date(`${to}T12:00:00Z`).getTime();
  return Math.round((second - first) / 86400000);
}

function expectedDaily(dateKey: string, slot: typeof dailySlots[number], variant: number) {
  const gameOrder = seededShuffle(games, `daily-games:${dateKey}:v2`);
  const index = dailySlots.indexOf(slot);
  const random = seededRandom(`daily:${dateKey}:${slot}:${variant}:v2`);
  const gameKey = gameOrder[(index + variant * 3) % gameOrder.length];
  const details = dailyDetails[slot];
  const difficultyRank = details.ranks[Math.floor(random() * details.ranks.length)];
  const difficultyKey = difficulties[difficultyRank - 1];
  const phase = details.phases[0] + Math.floor(random() * (details.phases[1] - details.phases[0] + 1));
  const digest = hash32(`recordacoes:${dateKey}:${slot}:${variant}:${gameKey}:${difficultyKey}:v2`).toString(36);
  return {
    id: `rf-${dateKey.replaceAll("-", "")}-${slot.slice(0, 1)}${variant}-${digest}`,
    gameKey,
    difficultyKey,
    difficultyRank,
    phase,
    reward: details.reward,
  };
}

function phasePoints(gameKey: string, difficultyKey: string, phase: number, elapsed: number) {
  const rank = difficultyRanks[difficultyKey];
  const target = baseTimes[gameKey] * (1 + (rank - 1) * 0.08) * (1 + (phase - 1) * 0.12);
  const base = Math.round(900 * difficultyMultipliers[rank - 1] * phaseMultipliers[phase - 1]);
  const speedRatio = clamp(1 - elapsed / target, 0, 0.65);
  return Math.max(1, base + Math.round(base * speedRatio) + 250 * rank * phase);
}

function luxorWaveCount(level: number) {
  const chapterLevel = ((level - 1) % 5) + 1;
  if (chapterLevel === 5) return 3;
  if (level >= 28 || (level >= 13 && chapterLevel === 4)) return 2;
  return 1;
}

function luxorStars(level: number, points: number) {
  const base = 3200 + level * 410 + (luxorWaveCount(level) - 1) * 2400;
  return [0.62, 0.84, 1].reduce((stars, multiplier) => stars + (points >= Math.round(base * multiplier) ? 1 : 0), 0);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Método inválido" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) throw new Error("Variáveis Supabase ausentes");

    const authorization = request.headers.get("Authorization") || "";
    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) return json({ error: "Sessão inválida" }, 401);

    const body = await request.json();
    const mode = String(body.mode || "free");
    const displayName = cleanName(body.displayName);
    if (!displayName) throw new Error("Nome inválido");
    const service = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

    if (mode === "daily") {
      const dateKey = String(body.dailyDate || "");
      const slot = String(body.slot || "") as typeof dailySlots[number];
      const variant = integer(body.variant, 0, 1);
      const today = saoPauloDateKey();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !dailySlots.includes(slot) || ![0, 1].includes(variant)) throw new Error("Desafio diário inválido");
      const distance = dateDistanceDays(dateKey, today);
      if (distance < 0 || distance > 1) throw new Error("A rotação diária não está mais ativa");
      const expected = expectedDaily(dateKey, slot, variant);
      if (
        String(body.dailyId || "") !== expected.id ||
        String(body.gameKey || "") !== expected.gameKey ||
        String(body.difficultyKey || "") !== expected.difficultyKey ||
        integer(body.phase, 1, 10) !== expected.phase
      ) throw new Error("Identificador diário não corresponde à rotação do servidor");

      const durationMs = integer(body.durationMs, 100, 3600000);
      const combo = integer(body.metrics?.combo, 0, 250);
      const accuracy = clamp(Number(body.metrics?.accuracy) || 0, 0, 100);
      const points = Math.round(phasePoints(expected.gameKey, expected.difficultyKey, expected.phase, durationMs) * expected.reward / 2 + combo * 16 + accuracy * 9);
      const { error } = await service.rpc("record_daily_score", {
        p_user_id: user.id,
        p_display_name: displayName,
        p_daily_id: expected.id,
        p_challenge_date: dateKey,
        p_slot: slot,
        p_variant: variant,
        p_game_key: expected.gameKey,
        p_difficulty_key: expected.difficultyKey,
        p_phase: expected.phase,
        p_points: points,
        p_duration_ms: durationMs,
        p_max_combo: combo,
        p_accuracy: accuracy,
      });
      if (error) throw error;
      return json({ mode, dailyId: expected.id, points, durationMs });
    }

    if (mode === "luxorCampaign") {
      const level = integer(body.level, 1, 40);
      const points = integer(body.points, 1, 5000000);
      const durationMs = integer(body.durationMs, 100, 7200000);
      const stars = Math.min(integer(body.stars, 0, 3), luxorStars(level, points));
      const maxCombo = integer(body.maxCombo, 0, 100000);
      const maxChain = integer(body.maxChain, 0, 10000);
      const accuracy = clamp(Number(body.accuracy) || 0, 0, 100);
      const { error } = await service.rpc("record_luxor_campaign_score", {
        p_user_id: user.id,
        p_display_name: displayName,
        p_level: level,
        p_points: points,
        p_duration_ms: durationMs,
        p_stars: stars,
        p_max_combo: maxCombo,
        p_max_chain: maxChain,
        p_accuracy: accuracy,
      });
      if (error) throw error;
      return json({ mode, level, points, durationMs, stars });
    }

    const gameKey = String(body.gameKey || "");
    const difficultyKey = String(body.difficultyKey || "");
    const durations = Array.isArray(body.phaseDurationsMs) ? body.phaseDurationsMs.map(Number) : [];
    const phasesCompleted = integer(body.phasesCompleted || durations.length, 1, 10);
    if (!gameSet.has(gameKey) || !difficultyRanks[difficultyKey]) throw new Error("Dados do desafio inválidos");
    if (durations.length !== phasesCompleted) throw new Error("Quantidade de fases inválida");
    if (durations.some((duration) => !Number.isFinite(duration) || duration < 100 || duration > 1800000)) throw new Error("Tempo de fase inválido");

    const points = durations.reduce((total, duration, index) => total + phasePoints(gameKey, difficultyKey, index + 1, duration), 0);
    const durationMs = Math.round(durations.reduce((total, duration) => total + duration, 0));
    const { error } = await service.rpc("record_free_score", {
      p_user_id: user.id,
      p_display_name: displayName,
      p_game_key: gameKey,
      p_difficulty_key: difficultyKey,
      p_points: points,
      p_duration_ms: durationMs,
      p_phases_completed: phasesCompleted,
    });
    if (error) throw error;
    return json({ mode: "free", points, durationMs, phasesCompleted });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Pontuação recusada" }, 400);
  }
});
