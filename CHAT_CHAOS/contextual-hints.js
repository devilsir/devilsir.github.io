/* CHAT CHAOS v1.1 · Neutral word-by-word hints. Never send answer translations to clients. */
(()=>{
'use strict';
const words=window.ChatChaosWords;
if(!words)return;
const bank=words.entries;
const data=window.ChatChaosLanguageData||{};
const rawSenses=data.polysemy||{};
const fallback={
  'i':['eu'], 'you':['você','vocês'], 'your':['seu / sua','de vocês'],
  'we':['nós'], 'they':['eles / elas'], 'this':['este / esta','isso'],
  'that':['aquele / aquela','que / isso'], 'can':['poder','conseguir'],
  'get':['pegar','receber','conseguir'], 'got':['recebi / conseguiu','passado de get'],
  'take':['pegar','levar','demorar'], 'post':['publicação','publicar'],
  'like':['gostar','como','curtida'], 'right':['direito','correto','direita'],
  'look':['olhar','aparência / visual'], 'light':['luz','leve','claro'],
  'mean':['significar','querer dizer','mau'], 'match':['partida','combinar'],
  'watch':['assistir','relógio','observar'], 'make':['fazer','criar'],
  'time':['tempo','horário','vez'], 'still':['ainda','parado / imóvel'],
  'fine':['bem','bom','multa'], 'free':['livre','grátis'],
  'open':['aberto','abrir'], 'close':['fechar','perto (adjetivo close)'],
  'call':['chamar','ligação / chamada'], 'game':['jogo','partida'],
  'fun':['divertido','diversão'], 'class':['aula','turma'],
  'will':['vai / irá','vontade'], 'be':['ser','estar'],
  'really':['realmente','muito'], 'went':['foi','passado de go'],
  'well':['bem','poço'], 'live':['ao vivo','viver'],
  'comment':['comentário','comentar'], 'share':['compartilhar','dividir'],
  'story':['história','publicação temporária'], 'group':['grupo'],
  'friend':['amigo(a)'], 'friends':['amigos(as)'],
  'today':['hoje'], 'tomorrow':['amanhã'], 'school':['escola'],
  'test':['prova','testar'], 'study':['estudar','estudo'],
  'want':['querer'], 'need':['precisar','necessidade'],
  'later':['mais tarde'], 'send':['enviar'],
  'for':['para','por','durante'], 'to':['para','a','marcador de infinitivo'],
  'with':['com'], 'on':['em','sobre','ligado'],
  'at':['em','às'], 'up':['para cima','terminado'],
  'after':['depois','após'], 'before':['antes'],
  'in':['em','dentro'], 'back':['de volta','costas'],
  'come':['vir','chegar'], 'please':['por favor'],
  'from':['de','desde'], 'about':['sobre','aproximadamente'],
  'one':['um','uma'], 'our':['nosso / nossa'],
  'her':['dela','a ela'], 'his':['dele'],
  'im':['eu sou / estou'], "i'm":['eu sou','eu estou'],
  "you're":['você é','você está'], "we're":['nós somos','nós estamos'],
  "don't":['não (auxiliar de negação)'], "can't":['não posso','não consigo']
};
function norm(v){return String(v||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[’]/g,"'")}
function meanings(w){
  // Prefer curated neutral polysemic senses; never show a whole translated phrase.
  const first=rawSenses[w];
  if(Array.isArray(first)){
    const senses=first.map(s=>Array.isArray(s)?s[0]:s.meaning).filter(Boolean).slice(0,3);
    if(senses.length)return senses;
  }
  const entries=fallback[w];if(entries?.length)return entries;
  const pt=bank[w];if(!pt)return [];
  return pt.split(/\s+\/\s+/).map(x=>x.trim()).filter(Boolean).slice(0,3);
}
const extraEveryday={
 gift:'presente', yesterday:'ontem', 'later':'mais tarde', photo:'foto', photos:'fotos',
 picture:'imagem / foto', follower:'seguidor', followers:'seguidores', following:'seguindo',
 people:'pessoas', person:'pessoa', someone:'alguém', anyone:'qualquer pessoa',
 something:'alguma coisa', nothing:'nada', different:'diferente', same:'mesmo / igual',
 again:'novamente', video:'vídeo', videos:'vídeos', song:'música', music:'música',
 writing:'escrevendo', wrote:'escreveu', reading:'lendo', read:'ler / leu',
 story:'história', post:'publicação / publicar', posted:'publicou', posting:'publicando',
 shared:'compartilhou', comment:'comentário / comentar', commented:'comentou',
 recently:'recentemente', always:'sempre', never:'nunca', almost:'quase',
 because:'porque', while:'enquanto', when:'quando', where:'onde', what:'o que',
 who:'quem', which:'qual', why:'por quê', how:'como', 
 help:'ajudar / ajuda', helping:'ajudando', helped:'ajudou', thanks:'obrigado(a) / valeu',
 now:'agora', tonight:'hoje à noite', weekend:'fim de semana', 
 class:'turma / aula', project:'projeto', presentation:'apresentação', 
 created:'criou', creating:'criando', tried:'tentou', trying:'tentando',
 watching:'assistindo', watched:'assistiu', listened:'ouviu', listening:'ouvindo',
 amazing:'incrível', nice:'legal / agradável', funny:'engraçado', fun:'divertido / diversão',
 cool:'legal / fresco', ready:'pronto(a)', busy:'ocupado(a)', easy:'fácil',
 difficult:'difícil', important:'importante', public:'público', private:'privado',
 wrong:'errado', correct:'certo / correto', really:'realmente / muito', 
 beautiful:'bonito(a)', drawing:'desenho', artwork:'obra de arte', edit:'editar / edição',
 original:'original', changed:'mudou / alterado', changing:'mudando',
 link:'link / ligação', profile:'perfil', account:'conta', news:'notícias',
 group:'grupo', school:'escola', friends:'amigos(as)', friend:'amigo(a)',
 rules:'regras', study:'estudar / estudo', studying:'estudando',
 before:'antes', after:'depois', back:'de volta / costas', during:'durante',
 first:'primeiro', last:'último / passado', best:'melhor', great:'ótimo',
 win:'ganhar / vitória', won:'ganhou', lost:'perdeu / perdido',
 surprise:'surpresa / surpreender', surprised:'surpreso(a)',
 message:'mensagem', send:'enviar', sent:'enviou', ask:'perguntar / pedir', asked:'perguntou',
 answered:'respondeu', reply:'responder / resposta', answer:'responder / resposta'
};
for(const [w,pt] of Object.entries(extraEveryday))if(!bank[w])bank[w]=pt;
words.count=Object.keys(bank).length;
const alwaysExcluded=new Set(['you know','for real','good game','well played','no cap','right now','get ready','go viral']);
function tokens(q,limit=12){
 const target=norm(q?.slang||'').replace(/[^a-z0-9]+/g,'');
 const targetWords=norm(q?.slang||'').match(/[a-z0-9]+/g)||[];
 const blocked=new Set(targetWords);
 const used=new Set();
 function collect(source,maximum){
   const found=[];
   const matches=norm(source).match(/[a-z0-9]+(?:'[a-z]+)?/g)||[];
   for(const w of matches){
     const normalized=w.replace(/[^a-z0-9]+/g,'');
     if(used.has(w)||blocked.has(w)||normalized===target||words.blacklist.has(w)||alwaysExcluded.has(w))continue;
     if(/^[0-9]+$/.test(w)||w.length<2&&!['i','a'].includes(w))continue;
     const senses=meanings(w);
     if(!senses.length)continue;
     used.add(w);found.push([w,senses.join(' / ')]);
     if(found.length>=maximum)break;
   }
   return found;
 }
 const contextLimit=Math.max(4,Math.ceil(limit*.45));
 const context=collect(q?.chat||'',contextLimit);
 const options=(q?.answers||[]).map((a,i)=>q?.bilingual?.[i]?.en||String(a));
 // Collect an equal small number of common words per alternative. Shuffle their order
 // deterministically so the glossary does NOT identify which option is correct.
 const optionSlots=Math.max(0,limit-context.length);
 const selections=options.flatMap((s,i)=>collect(s,Math.min(3,Math.ceil(optionSlots/4))).map(item=>({...{word:item[0],meaning:item[1]},option:i})));
 selections.sort((a,b)=>a.word.localeCompare(b.word,'en'));
 return context.concat(selections.slice(0,optionSlots).map(s=>[s.word,s.meaning]));
}

words.tokens=tokens;
words.meanings=meanings;
window.ChatChaosHints={tokens,meanings};
})();
