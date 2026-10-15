# Portfólio privado — implantação

Esta pasta prepara o backend, mas **não significa que ele já foi implantado**. Não interrompa os sites existentes antes de verificar o novo endereço. Os projetos continuam públicos no GitHub Pages até que os arquivos públicos sejam removidos do histórico do Git e da publicação.

## Escopos

- albums: Album-Familia e Album-World-Stars
- timbo: Timbo-Speaker e silvinho/silvinho

A função private-projects autentica senhas sem disponibilizar hashes ao navegador, emite sessão HMAC de quatro horas, aplica limitação de tentativas no Postgres e entrega arquivos de um bucket Supabase Storage não público. O navegador só pode acessar os assets via função autenticada, e não via URLs diretas do GitHub.

## Implantação

1. No projeto Supabase correto, aplicar a migração \`supabase/migrations/20261015000000_private_portfolio.sql\`, revisar políticas e confirmar que o bucket \`portfolio-private\` é privado.
2. Definir secrets no painel ou CLI: \`PORTFOLIO_SESSION_SECRET\` (pelo menos 32 bytes aleatórios), \`PORTFOLIO_ALBUMS_HASH\` e \`PORTFOLIO_TIMBO_HASH\`. Nunca commitar secrets, senhas ou chave service_role.
3. O hash esperado é \`pbkdf2-sha256$420000$HEX_SALT$HEX_DERIVED_KEY\`. Gerar localmente com Python: \`import hashlib,secrets; s=secrets.token_bytes(16); print("pbkdf2-sha256$420000$"+s.hex()+"$"+hashlib.pbkdf2_hmac("sha256",input("senha: ").encode(),s,420000).hex())\`. As credenciais precisam ser criadas no servidor, não no código público.
4. Implantar \`supabase/functions/private-projects/index.ts\` como função \`private-projects\` (verify_jwt=false) e testar login e erro por senha.
5. Em máquina local com clone completo do repositório, executar \`python tools/migrate-private-projects.py\` para pré-visualizar. Depois \`python tools/migrate-private-projects.py --apply\` com \`SUPABASE_URL\` e \`SUPABASE_SERVICE_ROLE_KEY\` **no ambiente local**. A chave administrativa nunca deve ir para o GitHub Pages.
6. **Ainda falta um frontend privado funcional:** hospedar a aplicação por proxy same-origin que encaminhe as requisições de HTML e assets para a função e mantenha a sessão; a função de acesso não equivale a um site pronto. HTML/CSS/JS dos quatro projetos usam caminhos relativos e devem ser testados nesse novo host, inclusive importmap, workers e mídia.
7. Depois da validação funcional e de segurança, substituir os links do portfólio pelo host privado. Remover as cópias dos projetos da branch pública **e de seus históricos publicamente acessíveis**, revogar URLs compartilhadas, invalidar caches e rotacionar credenciais. GitHub Pages não é host apropriado para dados privados.

## Observações importantes

- O hash PBKDF2 verificado no navegador da versão antiga não é considerado segredo. Não reutilize esses hashes no frontend novo.
- O cookie com \`SameSite=None\` exige HTTPS e poderá ser bloqueado como cookie de terceiros se usar o domínio \`supabase.co\` diretamente. Prefira domínio próprio de proxy same-origin, revise a política de cookies e nunca use um token permanente em query string.
- Os limites por IP ajudam, mas senhas curtas compartilhadas continuam fracas. O usuário deve considerar substituí-las antes de expor o site.
- O backend não concede privacidade enquanto arquivos originais estão publicados em repositório público.
