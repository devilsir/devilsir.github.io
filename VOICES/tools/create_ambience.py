#!/usr/bin/env python3
"""Create six original synthetic WAV soundscapes. No downloaded samples.

Python 3 + NumPy. Mono 22,050 Hz PCM16. Fixed seeds, seamless boundaries.
These are stylized game sounds, not recordings of people or traditions.
"""
from pathlib import Path
import json
import wave
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'audio'
RATE=22050
SECONDS=16
def tone(track,at,duration,hz,volume,sweep=0):
    start=int(at*RATE);count=min(int(duration*RATE),len(track)-start)
    if count<=0:return
    t=np.arange(count)/RATE
    env=np.sin(np.pi*np.arange(count)/count)**2
    track[start:start+count]+=np.sin(2*np.pi*(hz*t+.5*sweep*t*t))*env*volume
def rustle(track,rng,at,duration,volume,cutoff=1800):
    start=int(at*RATE);count=min(int(duration*RATE),len(track)-start)
    if count<=0:return
    freqs=np.fft.rfftfreq(count,1/RATE)
    spec=np.fft.rfft(rng.normal(0,1,count))*np.exp(-(freqs/cutoff)**2)
    sound=np.fft.irfft(spec,n=count);sound/=max(.001,np.max(np.abs(sound)))
    track[start:start+count]+=sound*np.sin(np.pi*np.arange(count)/count)**2*volume
def build(name,seed):
    rng=np.random.default_rng(seed);length=RATE*SECONDS;t=np.arange(length)/RATE
    freq=np.fft.rfftfreq(length,1/RATE)
    spec=np.fft.rfft(rng.normal(0,1,length))
    spec*=np.exp(-(freq/(500 if name=='library' else 1700))**2)/np.sqrt(np.maximum(freq,80))
    track=np.fft.irfft(spec,n=length);track/=max(.001,np.max(np.abs(track)))
    track*={'plaza':.045,'library':.014,'park':.035,'market':.03,'studio':.014,'lab':.018}[name]
    if name in ['plaza','park']:
        for at in [1.2,3.7,6.2,9,12.5,14.2]:
            for shift in [0,.22]:tone(track,at+shift,.18,rng.uniform(1900,2400),.045,2300)
        rustle(track,rng,5,1.4,.04,1200);rustle(track,rng,10,1.6,.035,1400)
    if name=='plaza':track+=.006*np.sin(2*np.pi*250*t)*(1+.3*np.sin(2*np.pi*3*t))
    if name in ['market','plaza']:
        for i in range(12):
            at=.8+i*1.15
            for formant in [160,310,620]:tone(track,at,.6,formant+rng.uniform(-30,30),.009,rng.uniform(-40,40))
            rustle(track,rng,at+.22,.11,.027,1100)
        tone(track,5.5,.3,920,.023);tone(track,5.7,.5,1220,.016)
    if name=='library':
        for at in [2.5,6.1,10.2,13.7]:rustle(track,rng,at,.45,.028,3500);rustle(track,rng,at+.62,.09,.02,700)
        for at in np.arange(.5,15.5,1):tone(track,at,.04,1100,.006)
    if name in ['studio','lab']:
        track+=.005*np.sin(2*np.pi*50*t)+.002*np.sin(2*np.pi*100*t)
        for at in [3,7,11,14]:tone(track,at,.12,700 if name=='lab' else 420,.017);rustle(track,rng,at+.3,.08,.012,1400)
    fade=int(.06*RATE);track[:fade]*=np.linspace(0,1,fade);track[-fade:]*=np.linspace(1,0,fade)
    data=(np.clip(track,-.8,.8)*32767).astype('<i2');dest=OUT/(name+'.wav')
    with wave.open(str(dest),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(data.tobytes())
    return {'file':dest.name,'duration':SECONDS,'sampleRate':RATE,'channels':1,'bits':16,'peak':round(float(np.max(np.abs(track))),4),'original':True,'seed':seed}
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    entries=[build(name,901+i) for i,name in enumerate(['plaza','library','park','market','studio','lab'])]
    (OUT/'manifest.json').write_text(json.dumps({'license':'CC0-1.0','method':'Original synthetic sonification; no recordings or external samples.','loops':entries},indent=2)+'\n')
    print(json.dumps({'loops':len(entries),'seconds':sum(e['duration'] for e in entries)},indent=2))
if __name__=='__main__':main()
