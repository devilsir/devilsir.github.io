// O backend antigo de ranking não está disponível. Evita chamadas de autenticação
// para um projeto Supabase com DNS inválido; progresso local segue funcionando.
// A autenticação dos assets privados ocorre separadamente via access-gate.js.
window.ALBUM_SUPABASE = { url: "", anonKey: "", scoreFunction: "submit-score", dailyFunction: "daily-context" };
