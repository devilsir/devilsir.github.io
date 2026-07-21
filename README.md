<div align="center">

# Central de Projetos Interativos

**Plataforma web que reúne experiências educacionais, jogos, álbuns digitais, visualizações 3D e projetos autorais em um único ambiente.**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Publicado-222222?logo=github)](https://devilsir.github.io/)
[![HTML5](https://img.shields.io/badge/HTML5-Frontend-E34F26?logo=html5\&logoColor=white)](#tecnologias)
[![CSS3](https://img.shields.io/badge/CSS3-Interface-1572B6?logo=css3\&logoColor=white)](#tecnologias)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript\&logoColor=111111)](#tecnologias)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?logo=threedotjs)](#tecnologias)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase\&logoColor=white)](#tecnologias)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

[**Acessar a plataforma**](https://devilsir.github.io/)

</div>

## Sobre o projeto

A **Central de Projetos Interativos** é um repositório público desenvolvido para organizar e disponibilizar experiências digitais voltadas à educação, à experimentação visual e ao entretenimento.

A plataforma funciona como um portal para diferentes aplicações independentes, incluindo álbuns digitais gamificados, atividades de Química, simulações educacionais, experiências tridimensionais, visualizadores de modelos e projetos autorais. A maior parte das aplicações é executada diretamente no navegador, sem necessidade de instalação ou processo de compilação.

O projeto foi estruturado para publicação por meio do **GitHub Pages**, com interfaces responsivas para computadores e dispositivos móveis.

## Principais recursos

* Portal centralizado para acesso aos projetos publicados.
* Aplicações web independentes construídas com HTML, CSS e JavaScript.
* Experiências educacionais interativas relacionadas a Química e Língua Inglesa.
* Álbuns digitais com inventário, desafios, progressão e persistência local.
* Minijogos com diferentes níveis de dificuldade e sistema de pontuação.
* Ranking online integrado ao Supabase.
* Reconhecimento de imagens realizado no navegador.
* Visualização de modelos e animações 3D com Three.js e WebGL.
* Suporte a modelos nos formatos GLB, glTF e FBX.
* Controles adaptados para mouse, teclado e telas sensíveis ao toque.
* Recursos de acessibilidade, atributos ARIA e preferência por movimento reduzido.
* Versão Android do álbum World Stars desenvolvida com Capacitor.

## Projetos disponíveis

| Projeto                                                 | Descrição                                                                                                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [**Álbum Família**](./Album-Familia/)                   | Álbum digital de recordações com 64 figurinhas, 64 desafios, oito modalidades de minijogos, cinco dificuldades, progressão local e rankings online.      |
| [**World Stars 2026**](./Album-World-Stars/)            | Álbum digital educativo com 77 figurinhas, reconhecimento de imagem, inventário, perfis, perguntas em inglês e acompanhamento de progresso.              |
| [**World Stars Android**](./Album-World-Stars-Android/) | Empacotamento Android do álbum World Stars utilizando Capacitor, Gradle e Android Studio.                                                                |
| [**Animações Interativas**](./animacoes/)               | Coleção de dez experiências educacionais, incluindo neutralização, cargas elétricas, geometria molecular, íons, raio atômico e concentração de soluções. |
| [**Roleta Química**](./RoletaQuimica/)                  | Atividade gamificada e responsiva para revisão e prática de conteúdos de Química.                                                                        |
| [**Models and Animations**](./effects/)                 | Laboratório WebGL para visualização de personagens, animações, armas, pets e efeitos visuais em tempo real.                                              |
| [**Sobre**](./Sobre/)                                   | Apresentação profissional interativa com personagem 3D e acesso a projetos selecionados.                                                                 |
| [**Chora Timbó**](./choratimbo/)                        | Experiência autoral com modelos tridimensionais, animações, áudio e identidade visual própria.                                                           |
| [**Assets compartilhados**](./assets/)                  | Recursos globais de interface, estilos e scripts utilizados pela página principal.                                                                       |

## Experiências educacionais

A área de animações reúne módulos independentes que apresentam conceitos científicos de forma visual e interativa:

* Café Lab: concentração, diluição e titulação.
* Cargas e atração: interação elétrica, indução e atrito.
* Geometria molecular em três dimensões.
* Hotel Alchy.
* Visualizador tridimensional de íons.
* Laboratório 3D de neutralização.
* Marcha dos Cátions.
* Laboratório interativo de neutralização.
* RPG sobre raio atômico e iônico.
* Visualizador comparativo de raios atômicos.

> As simulações possuem finalidade didática e podem utilizar simplificações conceituais para facilitar a visualização e a aprendizagem.

## Tecnologias

### Frontend

* HTML5
* CSS3
* JavaScript sem framework
* Canvas API
* Web Audio API
* Local Storage
* Design responsivo

### Gráficos e conteúdo 3D

* Three.js
* WebGL
* GLTFLoader
* FBXLoader
* OrbitControls
* Modelos GLB, glTF e FBX

### Dados e serviços

* Supabase
* PostgreSQL
* Autenticação anônima
* Row Level Security
* Funções de banco de dados e Edge Functions

### Aplicativo Android

* Capacitor
* Android Studio
* Gradle
* Java

### Publicação

* GitHub Pages
* GitHub

## Estrutura do repositório

```text
.
├── Album-Familia/               # Álbum de recordações e ranking online
├── Album-World-Stars/            # Álbum educativo para navegador
├── Album-World-Stars-Android/    # Projeto Android com Capacitor
├── RoletaQuimica/                # Jogo educacional de Química
├── Sobre/                        # Apresentação profissional interativa
├── animacoes/                    # Simulações e experiências educacionais
├── assets/                       # Arquivos compartilhados da página principal
├── choratimbo/                   # Projeto autoral com áudio e modelos 3D
├── effects/                      # Visualizador de modelos, animações e efeitos
├── index.html                    # Página inicial da Central de Projetos
├── LICENSE                       # Licença MIT
└── README.md                     # Documentação do repositório
```

## Execução local

Por utilizar módulos JavaScript, modelos tridimensionais e requisições de arquivos, recomenda-se executar o projeto por meio de um servidor HTTP local em vez de abrir os arquivos HTML diretamente.

### 1. Clonar o repositório

```bash
git clone https://github.com/devilsir/devilsir.github.io.git
cd devilsir.github.io
```

### 2. Iniciar um servidor local

Com Python 3:

```bash
python -m http.server 8000
```

Em alguns sistemas, o comando pode ser:

```bash
python3 -m http.server 8000
```

### 3. Abrir no navegador

Acesse:

```text
http://localhost:8000
```

Não há etapa de build para a versão web principal.

## Configuração do Supabase

O ranking online do **Álbum Família** utiliza Supabase para autenticação anônima, armazenamento de perfis e registro das melhores pontuações.

1. Crie um projeto no Supabase.
2. Ative a autenticação anônima no painel de autenticação.
3. Execute o arquivo [`Album-Familia/supabase-setup.sql`](./Album-Familia/supabase-setup.sql) no SQL Editor.
4. Configure a URL do projeto e a chave pública em [`Album-Familia/supabase-config.js`](./Album-Familia/supabase-config.js).
5. Publique e configure a função utilizada para o envio seguro das pontuações, caso a instalação utilize Edge Functions.

Exemplo de configuração:

```javascript
window.ALBUM_SUPABASE = {
  url: "https://SEU-PROJETO.supabase.co",
  anonKey: "SUA_CHAVE_PUBLICA",
  scoreFunction: "submit-score"
};
```

A chave pública do Supabase pode ser utilizada no frontend quando as políticas de **Row Level Security** estiverem configuradas corretamente. Chaves administrativas ou de `service_role` nunca devem ser adicionadas ao repositório.

## Aplicativo Android

O diretório [`Album-World-Stars-Android`](./Album-World-Stars-Android/) contém a versão empacotada com Capacitor.

### Requisitos

* Node.js e npm
* Android Studio
* Android SDK
* Java Development Kit compatível com a versão do Gradle

### Instalação

```bash
cd Album-World-Stars-Android
npm install
npm run cap:sync
npm run cap:open
```

Para gerar um APK de depuração no Windows:

```bash
npm run apk:debug
```

Em Linux ou macOS, o APK também pode ser gerado diretamente pelo Gradle Wrapper:

```bash
cd android
./gradlew assembleDebug
```

## Publicação no GitHub Pages

O repositório foi preparado para publicação direta pelo GitHub Pages.

1. Acesse **Settings** no repositório.
2. Abra a seção **Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**.
4. Escolha a branch `main` e o diretório `/ (root)`.
5. Salve a configuração.

Após a implantação, a página ficará disponível em:

```text
https://devilsir.github.io/
```

## Compatibilidade

As experiências são direcionadas às versões atuais dos principais navegadores:

* Google Chrome
* Microsoft Edge
* Mozilla Firefox
* Safari
* Navegadores móveis baseados em Chromium ou WebKit

Recursos tridimensionais dependem de suporte a WebGL. O desempenho pode variar conforme o dispositivo, a memória disponível e a capacidade gráfica do navegador.

## Privacidade e armazenamento

Algumas aplicações armazenam progresso, preferências e dados de inventário no `localStorage` do navegador. Esses dados permanecem associados ao dispositivo e ao navegador utilizados.

No World Stars, o processamento de reconhecimento das figurinhas é realizado localmente no navegador. No Álbum Família, os dados enviados ao ranking online são tratados pela integração configurada com o Supabase.

## Contribuição

Contribuições podem ser enviadas por meio de issues ou pull requests.

Antes de propor alterações:

1. Crie um fork do repositório.
2. Abra uma branch específica para a modificação.
3. Preserve a organização dos diretórios e os caminhos relativos dos assets.
4. Teste as alterações em desktop e dispositivo móvel.
5. Descreva claramente o objetivo e o impacto da contribuição.

## Licença

Este projeto é distribuído sob a licença MIT. Consulte o arquivo [`LICENSE`](./LICENSE) para obter os termos completos.

## Autor

**Lucas Xavier Nardelli**
Projetos educacionais, desenvolvimento web, modelagem 3D, programação e experimentação com inteligência artificial.

---

<div align="center">
  Desenvolvido para transformar conteúdo, tecnologia e experimentação visual em experiências interativas acessíveis pelo navegador.
</div>
