import { createClient } from 'npm:@supabase/supabase-js@2';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};

const respond = (status: number, value: Record<string, unknown>) =>
  new Response(JSON.stringify(value), { status, headers });

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return respond(405, { error: 'Método não permitido.' });

  try {
    const url = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !anonKey || !serviceKey) return respond(503, { error: 'Credenciais administrativas da função não configuradas.' });

    const match = /^Bearer\s+(.+)$/i.exec(request.headers.get('Authorization') ?? '');
    if (!match) return respond(401, { error: 'Sessão do professor ausente.' });

    const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: session, error: sessionError } = await client.auth.getUser(match[1]);
    if (sessionError || !session.user) return respond(401, { error: 'Sessão inválida. Entre novamente como professor.' });

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: teacher, error: teacherError } = await admin.from('orbital_teacher_roles')
      .select('user_id').eq('user_id', session.user.id).maybeSingle();
    if (teacherError) return respond(503, { error: 'Verifique a configuração dos papéis docentes no Supabase.' });
    if (!teacher) return respond(403, { error: 'Esta conta não tem permissão de professor.' });

    let data: unknown;
    try { data = await request.json(); } catch { return respond(400, { error: 'Dados inválidos.' }); }
    if (!data || typeof data !== 'object') return respond(400, { error: 'Dados inválidos.' });
    const { action, studentId, password } = data as Record<string, unknown>;
    if (action !== 'reset-password' && action !== 'delete-student') return respond(400, { error: 'Ação desconhecida.' });
    if (typeof studentId !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(studentId))
      return respond(400, { error: 'Identificador de aluno inválido.' });
    if (studentId === session.user.id) return respond(403, { error: 'Não é permitido modificar a própria conta docente.' });

    const { data: target, error: profileError } = await admin.from('orbital_profiles')
      .select('id,name,classroom').eq('id', studentId).maybeSingle();
    if (profileError) return respond(503, { error: 'Não foi possível verificar o perfil.' });
    if (!target) return respond(404, { error: 'Aluno não encontrado no banco online.' });

    const { data: targetTeacher, error: roleError } = await admin.from('orbital_teacher_roles')
      .select('user_id').eq('user_id', studentId).maybeSingle();
    if (roleError) return respond(503, { error: 'Não foi possível validar as permissões deste perfil.' });
    if (targetTeacher) return respond(403, { error: 'Não é possível modificar outra conta docente por este painel.' });

    if (action === 'reset-password') {
      if (typeof password !== 'string' || password.length < 6 || password.length > 64)
        return respond(400, { error: 'Informe uma nova senha de 6 a 64 caracteres.' });
      const { error } = await admin.auth.admin.updateUserById(studentId, { password });
      if (error) return respond(400, { error: 'Falha ao redefinir senha: ' + error.message });
      return respond(200, { ok: true, action, studentId });
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(studentId);
    if (deleteError) return respond(400, { error: 'Falha ao excluir perfil: ' + deleteError.message });
    return respond(200, { ok: true, action, studentId });
  } catch {
    return respond(500, { error: 'Não foi possível executar a operação administrativa.' });
  }
});
