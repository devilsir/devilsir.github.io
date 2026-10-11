const OrbitalCloud=(()=>{
 const url='https://uknijxfkmsuqpbiyllvc.supabase.co';
 const key='sb_publishable_4p5Ldey6FfDC9Mjx0pg79w_n2O0-O6D';
 const state={student:null,teacher:null,ready:false,syncing:false,lastError:'',lastSuccess:0,pending:false};
 let timer=null,writeQueue=Promise.resolve(),teacherTimer=null,hasPending=false;
 const opts={apikey:key,'Content-Type':'application/json'};
 const text=s=>String(s||'').trim().replace(/\s+/g,' ');
 const classroom=s=>/^Turma [12]$/.test(s)?s:'Turma 1';
 const pretty=e=>{const msg=String(e?.message||e||'Falha de conexão');if(/Invalid login credentials/i.test(msg))return 'Nome, turma ou senha inválidos.';if(/Email not confirmed/i.test(msg))return 'Desative “Confirm email” no Supabase Auth para usar perfis sem e-mail.';if(/email rate limit|rate limit/i.test(msg))return 'Limite temporário de cadastros atingido. Aguarde e tente novamente.';if(/relation.*does not exist|schema cache/i.test(msg))return 'Execute o arquivo supabase-setup.sql no SQL Editor do Supabase.';return msg};
 async function send(path,{method='GET',body=null,token=null,query=null}={}){
  const api=(path==='/signup'||path==='/token')?'/auth/v1':'/rest/v1';
  let response;try{response=await fetch(url+api+path+(query||''),{method,headers:{...opts,...(token?{Authorization:'Bearer '+token}:{}) ,...(method==='POST'&&api==='/rest/v1'?{Prefer:'resolution=merge-duplicates,return=minimal'}:{})},body:body===null?undefined:JSON.stringify(body),cache:'no-store'})}catch{throw Error('Sem conexão com Supabase. Confira sua internet e o projeto.')}
  let payload=null;try{payload=await response.json()}catch{}if(!response.ok){throw Error(pretty(payload?.msg||payload?.message||payload?.error_description||payload?.error||'Erro HTTP '+response.status))}return payload;
 }
 async function sha(input){const data=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input));return Array.from(new Uint8Array(data),v=>v.toString(16).padStart(2,'0')).join('')}
 async function email(name,group){return 'student-'+(await sha(text(group).normalize('NFKC').toLowerCase()+'|'+text(name).normalize('NFKC').toLowerCase())).slice(0,48)+'@example.com'}
 async function token(kind){let s=state[kind];if(!s)throw Error('Faça login novamente.');if(Date.now()<s.until-90000)return s.access_token;
  const r=await send('/token',{method:'POST',body:{refresh_token:s.refresh_token},query:'?grant_type=refresh_token'});state[kind]={...s,...r,until:Date.now()+(r.expires_in||3600)*1000};return r.access_token;
 }
 async function signup(name,group,password){if(password.length<6)throw Error('Crie uma senha de pelo menos 6 caracteres.');const r=await send('/signup',{method:'POST',body:{email:await email(name,group),password,data:{player_name:text(name),classroom:classroom(group)}}});if(!r?.access_token||!r?.user?.id)throw Error('Ative Authentication → Providers → Email → Confirm email: desativado. O cadastro ainda não iniciou uma sessão.');state.student={...r,until:Date.now()+(r.expires_in||3600)*1000};return r.user.id}
 async function login(name,group,password){const r=await send('/token',{method:'POST',query:'?grant_type=password',body:{email:await email(name,group),password}});if(!r?.access_token||!r?.user?.id)throw Error('O perfil não foi autenticado.');state.student={...r,until:Date.now()+(r.expires_in||3600)*1000};return r.user.id}
 async function saveNow(snapshot){const s=state.student;if(!s||snapshot.profileId!==s.user?.id)return false;
  const auth=await token('student');await send('/orbital_profiles',{method:'POST',token:auth,body:{id:s.user.id,name:snapshot.playerName,classroom:classroom(snapshot.classroom),save:snapshot,updated_at:new Date().toISOString()}});state.lastSuccess=Date.now();state.lastError='';return true}
 function enqueue(snapshot){if(!state.student||snapshot.profileId!==state.student.user?.id)return Promise.resolve(false);hasPending=true;state.pending=true;
  const work=async()=>{try{await saveNow(snapshot);hasPending=false;state.pending=false;return true}catch(e){state.lastError=pretty(e);state.pending=true;return false}};
  writeQueue=writeQueue.catch(()=>{}).then(work);return writeQueue;
 }
 function schedule(){if(!state.student||!Progress.data.profileId||state.student.user?.id!==Progress.data.profileId)return;
  state.pending=true;clearTimeout(timer);timer=setTimeout(()=>enqueue(JSON.parse(JSON.stringify(Progress.data))),1350);
 }
 function flush(){clearTimeout(timer);timer=null;return enqueue(JSON.parse(JSON.stringify(Progress.data)))}
 async function retrieve(){const s=state.student;if(!s)return null;const r=await send('/orbital_profiles',{token:await token('student'),query:'?id=eq.'+encodeURIComponent(s.user.id)+'&select=id,name,classroom,save,updated_at'});return Array.isArray(r)?r[0]||null:null}
 async function teacherLogin(mail,password){const r=await send('/token',{method:'POST',query:'?grant_type=password',body:{email:mail.trim(),password}});if(!r?.access_token||!r?.user?.id)throw Error('Autenticação do professor falhou.');state.teacher={...r,until:Date.now()+(r.expires_in||3600)*1000};try{const t=await send('/orbital_teacher_roles',{token:await token('teacher'),query:'?user_id=eq.'+encodeURIComponent(r.user.id)+'&select=user_id'});if(!t?.length)throw Error('Esta conta ainda não está autorizada como professor. Execute a etapa de autorização do SQL.');return true}catch(e){state.teacher=null;throw e}}
 async function students(){if(!state.teacher)throw Error('Entre como professor.');return await send('/orbital_profiles',{token:await token('teacher'),query:'?select=id,name,classroom,save,updated_at&order=classroom.asc,name.asc'})}
 async function curriculum(){const person=state.student?'student':state.teacher?'teacher':null;if(!person)return null;const data=await send('/orbital_curriculum',{token:await token(person),query:'?id=eq.1&select=config'});return data?.[0]?.config||null}
 async function writeCurriculum(config){if(!state.teacher)throw Error('O professor precisa conectar sua conta Supabase para publicar as perguntas.');await send('/orbital_curriculum',{method:'POST',token:await token('teacher'),body:{id:1,config,updated_at:new Date().toISOString()}})}
 function scheduleCurriculum(config){if(!state.teacher)return;writeCurriculum(JSON.parse(JSON.stringify(config))).catch(e=>{state.lastError=pretty(e)})}
 async function teacherSync(){const cfg=await curriculum();if(cfg&&typeof TeacherConsole!=='undefined'&&!TeacherConsole.settings().questions?.length)TeacherConsole.applyRemote(cfg);return cfg}
 async function getCurriculum(){try{const cfg=await curriculum();if(cfg&&typeof TeacherConsole!=='undefined')TeacherConsole.applyRemote(cfg);return true}catch(e){state.lastError=pretty(e);return false}}
 function logoutTeacher(){state.teacher=null;clearTimeout(teacherTimer)}
 function logout(){state.student=null;logoutTeacher();clearTimeout(timer);state.pending=false}
 return {url,key,state,signup,login,logout,retrieve,flush,schedule,teacherLogin,students,curriculum,writeCurriculum,scheduleCurriculum,teacherSync,getCurriculum,logoutTeacher,classroom,pretty};
})();
