(function (App) {
  "use strict";

  const { PIPER_VOICES, listStoredVoiceIds, synthesize, downloadVoice, removeVoice } = App.piperTts;

  function splitSpeechChunks(text, maxLen = 210) {
    const cleaned = String(text || "")
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleaned) return [];

    const paragraphs = cleaned.split(/\n{2,}/);
    const chunks = [];

    const pushBalanced = (segment) => {
      const trimmed = segment.trim();
      if (!trimmed) return;

      if (trimmed.length <= maxLen) {
        chunks.push(trimmed);
        return;
      }

      const subParts = trimmed.split(/(?<=[,;:\u2014\u2013])\s+/);
      let current = "";
      const flush = () => {
        const c = current.trim();
        if (c) chunks.push(c);
        current = "";
      };

      for (const part of subParts) {
        if (part.length <= maxLen) {
          const candidate = current ? `${current} ${part}` : part;
          if (candidate.length <= maxLen) {
            current = candidate;
          } else {
            flush();
            current = part;
          }
          continue;
        }

        flush();
        for (const word of part.split(/\s+/)) {
          const candidate = current ? `${current} ${word}` : word;
          if (candidate.length > maxLen && current) {
            flush();
            current = word;
          } else {
            current = candidate;
          }
        }
        flush();
      }
      flush();
    };

    for (const para of paragraphs) {
      const sentences = para.match(/[^.!?…\n]+(?:[.!?…]+["”»)]*|\n|$)/g) || [para];
      let buffer = "";

      for (const rawSentence of sentences) {
        const sentence = rawSentence.replace(/\s+/g, " ").trim();
        if (!sentence) continue;

        if (sentence.length > maxLen) {
          if (buffer) {
            pushBalanced(buffer);
            buffer = "";
          }
          pushBalanced(sentence);
          continue;
        }

        const candidate = buffer ? `${buffer} ${sentence}` : sentence;
        if (candidate.length <= Math.min(maxLen, 175)) {
          buffer = candidate;
        } else {
          if (buffer) pushBalanced(buffer);
          buffer = sentence;
        }
      }

      if (buffer) pushBalanced(buffer);
    }

    return chunks;
  }

  function scoreVoice(voice, preferredLang = "pt", storedNeuralIds = new Set()) {
    const lang = (voice.lang || "").toLowerCase();
    const name = (voice.name || "").toLowerCase();
    let score = 0;

    if (voice.localService) score += 120;
    if (voice.default) score += 12;

    if (preferredLang === "pt") {
      if (lang === "pt-br" || lang.startsWith("pt-br")) score += 95;
      else if (lang.startsWith("pt")) score += 65;
    } else if (preferredLang === "en") {
      if (lang === "en-us" || lang.startsWith("en-us")) score += 95;
      else if (lang.startsWith("en")) score += 65;
    }

    if (voice.neural) {
      // Downloaded neural Piper voices rank highest; undownloaded ones still appear prominently
      score += storedNeuralIds.has(voice.id) ? 48 : 34;
    } else {
      if (/natural|neural|enhanced|premium|luciana|francisca|antonio|thalita|maria|daniel/.test(name)) {
        score += 24;
      }
      if (/google|microsoft/.test(name)) {
        score += 10;
      }
      if (/espeak|compact|bells|whisper|zarvox|trinoids/.test(name)) {
        score -= 25;
      }
    }

    return score;
  }

  class SpeechReader {
    constructor({ onStateChange, onVoicesChange, onNeuralProgress, onError } = {}) {
      this.speechApiSupported = typeof window !== "undefined" && "speechSynthesis" in window;
      this.onStateChange = onStateChange || (() => {});
      this.onVoicesChange = onVoicesChange || (() => {});
      this.onNeuralProgress = onNeuralProgress || (() => {});
      this.onError = onError || (() => {});

      this.storedNeuralIds = new Set();
      this.systemVoices = [];
      this.voices = [...PIPER_VOICES];
      this.chunks = [];
      this.currentIndex = 0;
      this.status = "idle";
      this.token = 0;

      this.voice = null;
      this.rate = 1;
      this.volume = 1;
      this.pitch = 1;

      this.keepAliveTimer = null;
      this.nextChunkTimer = null;
      this.activeAudio = null;
      this.activeAudioUrl = "";
      this.prefetchCache = new Map();
      this.wakeLock = null;
      this.wakeLockActive = false;

      this.refreshStoredNeuralVoices();

      if (this.speechApiSupported) {
        this._boundVoicesChanged = () => this.refreshVoices();
        window.speechSynthesis.addEventListener?.("voiceschanged", this._boundVoicesChanged);
        window.speechSynthesis.onvoiceschanged = this._boundVoicesChanged;

        setTimeout(() => this.refreshVoices(), 0);
        setTimeout(() => this.refreshVoices(), 300);
        setTimeout(() => this.refreshVoices(), 1200);
      } else {
        setTimeout(() => this.refreshVoices(), 0);
      }

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && this.status === "playing") {
          this._acquireWakeLock();
        }
      });
    }

    async refreshStoredNeuralVoices() {
      this.storedNeuralIds = await listStoredVoiceIds();
      this.refreshVoices();
      return this.storedNeuralIds;
    }

    isNeuralVoiceStored(voice) {
      return Boolean(voice?.neural && this.storedNeuralIds.has(voice.id));
    }

    async downloadNeuralVoice(voice) {
      if (!voice?.neural) return;
      await downloadVoice(voice.id, (info) => this.onNeuralProgress(info));
      await this.refreshStoredNeuralVoices();
    }

    async removeNeuralVoice(voice) {
      if (!voice?.neural) return;
      if (this.voice?.id === voice.id) this.stop();
      await removeVoice(voice.id);
      await this.refreshStoredNeuralVoices();
    }

    refreshVoices() {
      const sys = this.speechApiSupported ? window.speechSynthesis.getVoices() || [] : [];
      this.systemVoices = sys;
      this.voices = [...PIPER_VOICES, ...sys];
      this.onVoicesChange(this.voices, this.storedNeuralIds);
      return this.voices;
    }

    getSortedVoices({ preferredLang = "pt", offlineOnly = true } = {}) {
      const sorted = [...this.voices].sort((a, b) => {
        const diff =
          scoreVoice(b, preferredLang, this.storedNeuralIds) -
          scoreVoice(a, preferredLang, this.storedNeuralIds);
        return diff || `${a.lang} ${a.name}`.localeCompare(`${b.lang} ${b.name}`);
      });

      if (offlineOnly) {
        const local = sorted.filter((v) => v.localService);
        return local.length ? local : sorted;
      }
      return sorted;
    }

    setConfig({ voice, rate, volume, pitch } = {}, restartCurrentIfPlaying = false) {
      const voiceChanged = voice !== undefined && voice?.voiceURI !== this.voice?.voiceURI;
      const rateChanged = rate !== undefined && Number(rate) !== this.rate;
      const pitchChanged = pitch !== undefined && Number(pitch) !== this.pitch;

      if (voice !== undefined) this.voice = voice;
      if (rate !== undefined) this.rate = Number(rate) || 1;
      if (volume !== undefined) {
        this.volume = Number(volume);
        if (this.activeAudio) {
          this.activeAudio.volume = Math.max(0, Math.min(1, this.volume));
        }
      }
      if (pitch !== undefined) this.pitch = Number(pitch) || 1;

      if (voiceChanged || rateChanged) {
        this.prefetchCache.clear();
      }

      if (
        restartCurrentIfPlaying &&
        this.status === "playing" &&
        this.chunks.length > 0 &&
        (voiceChanged || rateChanged || (!this.voice?.neural && pitchChanged))
      ) {
        this._speakFrom(this.currentIndex);
      }
    }

    loadText(text) {
      const newChunks = splitSpeechChunks(text);
      this.chunks = newChunks;
      this.prefetchCache.clear();
      if (this.currentIndex >= newChunks.length) this.currentIndex = 0;
      this._emitState();
      return newChunks;
    }

    play(text, startIndex = null) {
      const chunks = splitSpeechChunks(text);
      if (!chunks.length) return false;

      this.chunks = chunks;
      this.prefetchCache.clear();
      const targetIndex =
        typeof startIndex === "number"
          ? Math.max(0, Math.min(chunks.length - 1, startIndex))
          : this.status === "paused" && this.currentIndex < chunks.length
            ? this.currentIndex
            : 0;

      this._speakFrom(targetIndex);
      return true;
    }

    pause() {
      if (this.status !== "playing") return;

      if (this.activeAudio) {
        try {
          this.activeAudio.pause();
        } catch {}
        this._clearTimers();
        this.status = "paused";
        this._releaseWakeLock();
        this._emitState();
        return;
      }

      this.token++;
      this._clearTimers();
      if (this.speechApiSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      this.status = "paused";
      this._releaseWakeLock();
      this._emitState();
    }

    resume() {
      if (this.status !== "paused") return;

      if (this.activeAudio) {
        this.status = "playing";
        this._acquireWakeLock();
        this._emitState();
        this.activeAudio.play().catch(() => {
          this._speakFrom(this.currentIndex);
        });
        return;
      }

      if (this.chunks.length > 0) {
        const idx = Math.min(this.currentIndex, this.chunks.length - 1);
        this._speakFrom(idx);
      }
    }

    stop() {
      this.token++;
      this._clearTimers();
      this._stopAudioElement();
      this.prefetchCache.clear();
      if (this.speechApiSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      this.status = "idle";
      this.currentIndex = 0;
      this._releaseWakeLock();
      this._emitState();
    }

    prev() {
      if (!this.chunks.length) return;
      const target = Math.max(0, this.currentIndex - 1);
      if (this.status === "playing") {
        this._speakFrom(target);
      } else {
        this._stopAudioElement();
        this.currentIndex = target;
        this._emitState();
      }
    }

    next() {
      if (!this.chunks.length) return;
      const target = Math.min(this.chunks.length - 1, this.currentIndex + 1);
      if (this.status === "playing") {
        this._speakFrom(target);
      } else {
        this._stopAudioElement();
        this.currentIndex = target;
        this._emitState();
      }
    }

    jumpTo(index) {
      if (!this.chunks.length) return;
      const target = Math.max(0, Math.min(this.chunks.length - 1, index));
      this._speakFrom(target);
    }

    async testVoice(voice) {
      if (!voice) return;
      this.stop();
      const isEn = (voice.lang || "").toLowerCase().startsWith("en");
      const sample = isEn
        ? "Hello. This is how your book will sound with a neural voice."
        : "Olá. É assim que a leitura do seu livro vai soar com esta voz natural.";

      if (voice.neural) {
        const activeToken = ++this.token;
        try {
          const wavBlob = await synthesize(sample, voice.id, {
            rate: this.rate,
            onProgress: (info) => this.onNeuralProgress(info)
          });
          await this.refreshStoredNeuralVoices();
          this.onNeuralProgress(null);
          if (activeToken !== this.token || !wavBlob) return;
          await this._playWavBlob(wavBlob, activeToken, () => {});
        } catch (err) {
          this.onNeuralProgress(null);
          this.onError(err?.message || "Não foi possível testar esta voz neural.");
        }
        return;
      }

      if (!this.speechApiSupported) return;
      const u = new SpeechSynthesisUtterance(sample);
      u.voice = voice;
      u.lang = voice.lang || "pt-BR";
      u.rate = this.rate;
      u.volume = this.volume;
      u.pitch = this.pitch;
      window.speechSynthesis.speak(u);
    }

    _stopAudioElement() {
      if (this.activeAudio) {
        try {
          this.activeAudio.onended = null;
          this.activeAudio.onerror = null;
          this.activeAudio.pause();
          this.activeAudio.src = "";
        } catch {}
        this.activeAudio = null;
      }
      if (this.activeAudioUrl) {
        URL.revokeObjectURL(this.activeAudioUrl);
        this.activeAudioUrl = "";
      }
    }

    async _playWavBlob(wavBlob, activeToken, onFinished) {
      this._stopAudioElement();
      const url = URL.createObjectURL(wavBlob);
      const audio = new Audio(url);
      audio.volume = Math.max(0, Math.min(1, this.volume));

      this.activeAudio = audio;
      this.activeAudioUrl = url;

      audio.onended = () => {
        if (activeToken !== this.token) return;
        this._stopAudioElement();
        onFinished?.();
      };
      audio.onerror = () => {
        if (activeToken !== this.token) return;
        this._stopAudioElement();
        onFinished?.();
      };

      await audio.play();
    }

    _prefetchNeuralChunk(index, activeToken) {
      if (!this.voice?.neural) return;
      if (index >= this.chunks.length) return;
      const key = `${this.voice.id}:${this.rate}:${index}`;
      if (this.prefetchCache.has(key)) return;

      const promise = synthesize(this.chunks[index], this.voice.id, { rate: this.rate }).catch(
        () => null
      );
      this.prefetchCache.set(key, promise);
      // Keep cache small
      if (this.prefetchCache.size > 3) {
        const oldestKey = this.prefetchCache.keys().next().value;
        if (oldestKey !== key) this.prefetchCache.delete(oldestKey);
      }
      void activeToken;
    }

    _speakFrom(index) {
      if (!this.chunks.length) return;
      if (!this.voice) {
        this.refreshVoices();
        this.voice = this.voices[0] || PIPER_VOICES[0];
      }

      this.token++;
      const activeToken = this.token;
      this._clearTimers();
      this._stopAudioElement();

      if (this.speechApiSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }

      this.currentIndex = Math.max(0, Math.min(this.chunks.length - 1, index));
      this.status = "playing";
      this._acquireWakeLock();
      this._emitState();

      this.nextChunkTimer = setTimeout(() => {
        this._speakCurrentChunk(activeToken);
      }, 30);
    }

    _advanceAfterChunk(activeToken) {
      if (activeToken !== this.token || this.status !== "playing") return;
      this.currentIndex++;
      if (this.currentIndex >= this.chunks.length) {
        this.status = "finished";
        this._clearTimers();
        this._releaseWakeLock();
        this._emitState();
        return;
      }
      this._emitState();
      this.nextChunkTimer = setTimeout(() => this._speakCurrentChunk(activeToken), 25);
    }

    async _speakNeuralChunk(activeToken) {
      const idx = this.currentIndex;
      const voice = this.voice;
      const key = `${voice.id}:${this.rate}:${idx}`;

      try {
        let wavBlob = null;
        if (this.prefetchCache.has(key)) {
          wavBlob = await this.prefetchCache.get(key);
          this.prefetchCache.delete(key);
        } else {
          const isStored = this.isNeuralVoiceStored(voice);
          if (!isStored) {
            this.onNeuralProgress({
              phase: "downloading",
              percent: 1,
              label: `Preparando ${voice.name}…`
            });
          } else {
            this.onNeuralProgress({
              phase: "synthesizing",
              percent: 100,
              label: `Gerando voz neural (${idx + 1}/${this.chunks.length})…`
            });
          }

          wavBlob = await synthesize(this.chunks[idx], voice.id, {
            rate: this.rate,
            onProgress: (info) => {
              if (activeToken === this.token) this.onNeuralProgress(info);
            }
          });
          if (!isStored) {
            await this.refreshStoredNeuralVoices();
          }
        }

        if (activeToken !== this.token || this.status !== "playing") {
          this.onNeuralProgress(null);
          return;
        }

        this.onNeuralProgress(null);

        if (!wavBlob) {
          this._advanceAfterChunk(activeToken);
          return;
        }

        // Prefetch next chunk in background while current WAV plays
        this._prefetchNeuralChunk(idx + 1, activeToken);

        await this._playWavBlob(wavBlob, activeToken, () => {
          this._advanceAfterChunk(activeToken);
        });
      } catch (err) {
        this.onNeuralProgress(null);
        console.error("Piper Neural TTS error:", err);
        if (activeToken === this.token) {
          this.status = "idle";
          this._clearTimers();
          this._releaseWakeLock();
          this._emitState();
          this.onError(err?.message || "Erro ao sintetizar áudio com a voz neural.");
        }
      }
    }

    _speakCurrentChunk(activeToken) {
      if (activeToken !== this.token || this.status !== "playing") return;

      if (this.currentIndex >= this.chunks.length) {
        this.status = "finished";
        this._clearTimers();
        this._releaseWakeLock();
        this._emitState();
        return;
      }

      if (this.voice?.neural) {
        this._speakNeuralChunk(activeToken);
        return;
      }

      if (!this.speechApiSupported) {
        this.onError("Síntese de voz nativa indisponível; selecione uma voz neural Piper.");
        this.stop();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(this.chunks[this.currentIndex]);
      if (this.voice) {
        utterance.voice = this.voice;
        utterance.lang = this.voice.lang || "pt-BR";
      } else {
        utterance.lang = "pt-BR";
      }
      utterance.rate = this.rate;
      utterance.volume = this.volume;
      utterance.pitch = this.pitch;

      utterance.onend = () => this._advanceAfterChunk(activeToken);

      utterance.onerror = (event) => {
        if (activeToken !== this.token) return;
        if (["canceled", "interrupted"].includes(event.error)) return;
        console.error("SpeechSynthesis error:", event.error);
        this.currentIndex++;
        if (this.currentIndex < this.chunks.length && this.status === "playing") {
          this._emitState();
          this.nextChunkTimer = setTimeout(() => this._speakCurrentChunk(activeToken), 80);
        } else {
          this.status = "idle";
          this._clearTimers();
          this._releaseWakeLock();
          this._emitState();
        }
      };

      this._startKeepAlive();
      window.speechSynthesis.speak(utterance);
    }

    _startKeepAlive() {
      if (this.keepAliveTimer) return;
      this.keepAliveTimer = setInterval(() => {
        if (this.status !== "playing") {
          this._clearKeepAlive();
          return;
        }
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch {}
      }, 8000);
    }

    _clearKeepAlive() {
      if (this.keepAliveTimer) {
        clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = null;
      }
    }

    _clearTimers() {
      this._clearKeepAlive();
      if (this.nextChunkTimer) {
        clearTimeout(this.nextChunkTimer);
        this.nextChunkTimer = null;
      }
    }

    async _acquireWakeLock() {
      if (this.wakeLock || !("wakeLock" in navigator)) return;
      try {
        this.wakeLock = await navigator.wakeLock.request("screen");
        this.wakeLockActive = true;
        this.wakeLock.addEventListener("release", () => {
          this.wakeLock = null;
          this.wakeLockActive = false;
          this._emitState();
        });
        this._emitState();
      } catch {
        this.wakeLockActive = false;
      }
    }

    async _releaseWakeLock() {
      if (!this.wakeLock) {
        this.wakeLockActive = false;
        return;
      }
      try {
        await this.wakeLock.release();
      } catch {}
      this.wakeLock = null;
      this.wakeLockActive = false;
    }

    _emitState() {
      const total = this.chunks.length;
      const progress =
        this.status === "finished"
          ? 100
          : total > 0
            ? Math.min(99, Math.round((this.currentIndex / total) * 100))
            : 0;

      this.onStateChange({
        status: this.status,
        chunks: this.chunks,
        currentIndex: this.currentIndex,
        totalChunks: total,
        progress,
        wakeLockActive: this.wakeLockActive
      });
    }

    destroy() {
      this.stop();
      if (this.speechApiSupported && this._boundVoicesChanged) {
        window.speechSynthesis.removeEventListener?.("voiceschanged", this._boundVoicesChanged);
      }
    }
  }

  App.tts = {
    splitSpeechChunks,
    scoreVoice,
    SpeechReader
  };
})((window.LeitorApp = window.LeitorApp || {}));
