# Hub de Simulações — estilo PhET (arquivo único)

Coleção de simulações interativas de **Química** e **Física** reunidas em **um único arquivo HTML**, com miniaturas clicáveis no estilo PhET. Tudo roda **offline** (sem servidor) em qualquer navegador moderno.

## ✨ Objetivos
- Facilitar o acesso a simulações para **aulas, apresentações e estudos**.
- Reunir diferentes experiências em um **hub simples, leve e responsivo**.
- Servir de base para **adicionar novas simulações** rapidamente.

## 🧪 Simulações incluídas
- **Laboratório de Neutralização** — pH, indicadores, formação de gás/precipitado e estequiometria básica.  
- **RPG — Raio Atômico & Íons** — visualização lúdica de variações de raio atômico e iônico.  
- **Visualizador de Raios (HTML/React)** — comparação e leitura visual de raios (átomos/íons).  
- **Cargas ⚡ — Interações e Indução** — atração/repulsão, polarização por indução e desafios.  
- **Café Lab v8 — Concentração, Diluição e Titulação** — modelo “de bancada” para concentração comum e molar, diluições, titulação por número de mols e visual da cor do café (gradientes).

> Obs.: as simulações têm **finalidade didática** e usam simplificações para tornar conceitos mais claros em sala.

## 🖼️ Como usar
1. **Baixe** o arquivo HTML do hub (ex.: `phet_style_hub-12_cafe_thumb_matched.html`).  
2. **Abra no navegador** (duplo clique ou arraste para a janela).  
3. **Clique na miniatura** para abrir a simulação em sobreposição (overlay).  
   - Use **“Abrir em nova aba”** ou **“Tela cheia”** quando disponível.

## 🔎 Recursos do hub
- **Busca por título ou tag** (“pH”, “Raios”, “Concentração”…).
- **Miniaturas estáticas** com visual consistente (fundo escuro + elementos “vidro”).  
- **Layout responsivo** e pronto para projetor/sala de aula.  
- **Arquivo único**: simulações embutidas como payloads base64.

## 🧩 Tecnologias
- **HTML, CSS e JavaScript** puro (sem build).
- Iframes com `srcdoc` e payloads `<script type="application/octet-stream">`.
- Algumas simulações internas usam **React** (embutido no próprio payload).

## 📦 Estrutura
- `phet_style_hub-*.html` — **arquivo único** com:
  - Estilos e UI do hub (cards, busca, overlay).  
  - **Array `SIMS`** com metadados (id, título, tags, miniatura, tamanho sugerido).  
  - **Payloads base64** das simulações (cada uma em um `<script id="b64-...">`).

## ➕ Como adicionar uma nova simulação
1. **Crie a miniatura** (SVG 960×540 no estilo das demais: fundo escuro, “vidro” translúcido `#ffffff10`, contorno azul-acinzentado).  
2. **Gere o HTML** da simulação final, autônomo.  
3. **Converta o HTML para base64** e embuta assim:
   ```html
   <script type="application/octet-stream" id="b64-minha_simulacao">...BASE64...</script>
   ```
4. **Adicione um item** no array `SIMS`:
   ```js
   {
     id: "minha_simulacao",
     title: "Título da Simulação",
     tags: ["Química", "pH"],
     thumb_scale: 0.22,
     suggested_size: [1200, 800],
     b64_id: "b64-minha_simulacao",
     thumb: "data:image/svg+xml;base64,..." // miniatura em SVG/base64
   }
   ```
5. Recarregue o arquivo no navegador — a nova simulação aparecerá no grid.

> Dica: manter **nomes consistentes** entre `id` e `b64_id` ajuda na manutenção.

## 🧭 Compatibilidade
- Testado em **Chrome, Edge e Firefox** (desktop).  
- Funciona offline; evite dependências de CDNs nas simulações internas se quiser 100% desconectado.

## 🧰 Roadmap
- Filtro por área (Química/Física) e por nível.  
- Botão de **copiar link direto** de cada simulação.  
- Suporte a **capturas automáticas** para miniaturas.

## 👤 Autor
**Lucas Xavier Nardelli** — 2025

## 📜 Licença
Este projeto está sob a **MIT License**. Veja o arquivo `LICENSE` (opcional).
