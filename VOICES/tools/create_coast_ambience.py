from pathlib import Path
import json
import wave
import numpy as np

root = Path(__file__).resolve().parents[1]
rate, seconds, seed = 22050, 18, 1828
rng = np.random.default_rng(seed)
t = np.arange(rate * seconds) / rate
frequencies = np.fft.rfftfreq(len(t), 1 / rate)
spectrum = np.fft.rfft(rng.normal(0, 1, len(t)))
spectrum *= np.exp(-(frequencies / 2400) ** 2) / np.sqrt(np.maximum(frequencies, 160))
wash = np.fft.irfft(spectrum, n=len(t))
wash /= max(.001, float(np.max(np.abs(wash))))
envelope = .012 + .055 * (.5 + .5 * np.sin(2 * np.pi * t / 6)) ** 2
track = wash * envelope
for at in [3.2, 11.7]:
    duration = .55
    start, count = int(at * rate), int(duration * rate)
    local = np.arange(count) / rate
    call = np.sin(2 * np.pi * (1300 * local + 350 * local ** 2))
    track[start:start + count] += .008 * call * np.sin(np.pi * local / duration) ** 2
pcm = (np.clip(track, -.8, .8) * 32767).astype('<i2')
out = root / 'assets/audio/beach.wav'
with wave.open(str(out), 'wb') as audio:
    audio.setnchannels(1)
    audio.setsampwidth(2)
    audio.setframerate(rate)
    audio.writeframes(pcm.tobytes())
manifest_file = root / 'assets/audio/manifest.json'
manifest = json.loads(manifest_file.read_text())
manifest['loops'] = [x for x in manifest['loops'] if x['file'] != 'beach.wav']
manifest['loops'].append(dict(file='beach.wav', duration=seconds, sampleRate=rate, channels=1, bits=16, peak=round(float(np.max(np.abs(track))), 4), original=True, seed=seed, license='CC0-1.0', description='Ondas e uma chamada discreta de ave; síntese original, sem amostras externas.'))
manifest_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
print(out)
