# Áudio original e gratuito — Mundo Vivo

O jogo usa música e efeitos de síntese local em `js/audio.js`, com Web Audio, e seis ambientes em WAV incluídos na pasta:

| Arquivo | Ambiente estilizado |
|---|---|
| plaza.wav | Fonte, passos, passarinhos e murmúrio não verbal da praça |
| library.wav | Papel, passos suaves, relógio e silêncio de sala de leitura |
| park.wav | Vento nas folhas e cantos sintéticos de passarinhos |
| market.wav | Movimento da feira, murmúrio não verbal, passos e pequenos sinais |
| studio.wav | Sala de ensaio com textura elétrica suave |
| lab.wav | Ventilação, equipamentos e sinais discretos de oficina |

Cada arquivo tem 16 segundos, mono PCM16 a 22.050 Hz. As bordas são suavizadas para repetição. Os níveis são discretos e não contêm picos acima da faixa permitida. São sonificações originais, não gravações reais de pessoas, animais ou de uma tradição cultural. Não há samples externos nem streaming.

Os WAV podem ser usados gratuitamente sob CC0 1.0; veja `LICENSE.txt`. Regeneração: `python tools/create_ambience.py` (Python e NumPy apenas para desenvolver). `manifest.json` registra formato, duração, sementes e nível máximo.

Ative o som pelo botão do título ou Configurações. Música, efeitos e ambientes têm volumes separados. O padrão inicial é silenciado, e a reprodução aguarda interação. Trocar o ambiente muda o loop; silenciar ou colocar a aba em segundo plano pausa o WAV. Há passos discretos durante o movimento.

As melodias e os padrões de oficina são originais do jogo. Não se apresentam como execução autêntica de samba de roda, capoeira ou de outra prática cultural. Para jogar, não é preciso instalar Python, NumPy ou qualquer dependência.
