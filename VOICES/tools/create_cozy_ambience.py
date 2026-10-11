#!/usr/bin/env python3
"""Three original, quiet CC0 ambience loops; no recordings or samples."""
import json
import wave
import numpy as np
from create_ambience import OUT, RATE, SECONDS, tone, rustle


def build(name, seed):
    rng = np.random.default_rng(seed)
    length = RATE * SECONDS
    t = np.arange(length) / RATE
    frequencies = np.fft.rfftfreq(length, 1 / RATE)
    spectrum = np.fft.rfft(rng.normal(0, 1, length))
    spectrum *= np.exp(-(frequencies / 700) ** 2) / np.sqrt(np.maximum(frequencies, 90))
    track = np.fft.irfft(spectrum, n=length)
    track *= .009 / max(.001, np.max(np.abs(track)))
    if name == 'garden':
        for at in [1.7, 5.9, 10.6, 14.1]:
            tone(track, at, .17, 2100, .022, 1700)
            tone(track, at + .25, .14, 2400, .017, -1400)
        for at in [3.4, 8.6, 12.2]:
            rustle(track, rng, at, 1.3, .02, 1500)
        rustle(track, rng, 6.4, 1.1, .013, 2400)
    elif name == 'archive':
        track += .002 * np.sin(2 * np.pi * 50 * t)
        for at in [2.8, 7.3, 12.6]:
            rustle(track, rng, at, .5, .018, 2200)
            tone(track, at + .8, .05, 240, .009)
    else:
        for at in [1.6, 5.3, 9.7, 13.4]:
            for offset in [0, .18, .44]:
                rustle(track, rng, at + offset, .045, .018, 1100)
            rustle(track, rng, at + .7, .28, .016, 2500)
    edge = int(.06 * RATE)
    track[:edge] *= np.linspace(0, 1, edge)
    track[-edge:] *= np.linspace(1, 0, edge)
    pcm = (np.clip(track, -.8, .8) * 32767).astype('<i2')
    with wave.open(str(OUT / (name + '.wav')), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(pcm.tobytes())
    return dict(file=name + '.wav', duration=SECONDS, sampleRate=RATE,
                channels=1, bits=16, peak=round(float(np.max(np.abs(track))), 4),
                original=True, seed=seed)


if __name__ == '__main__':
    manifest_path = OUT / 'manifest.json'
    manifest = json.loads(manifest_path.read_text())
    names = ['garden', 'archive', 'newsroom']
    manifest['loops'] = [e for e in manifest['loops'] if e['file'] not in [n + '.wav' for n in names]]
    manifest['loops'] += [build(name, 907 + i) for i, name in enumerate(names)]
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
    print('Nine original local CC0 soundscapes available.')
