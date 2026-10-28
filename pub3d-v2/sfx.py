import numpy as np, wave
exec(open("../vid6/audio_sfx.py").read().split("TB=3*BEAT")[0].replace("DUR=21.0","DUR=28.0"))
def pop(f=900):
    n=int(SR*.12);t=np.arange(n)/SR;return np.sin(2*np.pi*(f+600*np.exp(-t*40))*t)*np.exp(-t*30)*.35
def rewind(d=.6):
    n=int(SR*d);t=np.arange(n)/SR;k=t/d;f=900-700*k;s=np.sin(2*np.pi*np.cumsum(f+40*np.sin(2*np.pi*14*t))/SR)*.12
    nz=rng.standard_normal(n)*.08*np.sin(np.pi*k);return (s+nz)*np.sin(np.pi*k)**.5
def scratch(d=.35):
    n=int(SR*d);t=np.arange(n)/SR;f=300+900*np.abs(np.sin(2*np.pi*t/d*1.5));nz=rng.standard_normal(n);
    s=np.sin(2*np.pi*np.cumsum(f)/SR)*.3+nz*.1;return s*np.sin(np.pi*t/d)
# accroche
add(boom(),0.0,.8)
for i,q in enumerate([784,988,1175,1568]): add(bell(q,1.2,.13),0.05+i*.06)
add(rewind(.6),1.9,1.0)
# drop
add(scratch(),2.45,.9);add(whoosh(.4),2.3,.8)
for i,t in enumerate([3.1,3.75,4.4]): add(bell([659,880,1175][i],.7,.28),t);add(hat(.05),t,.8)
add(riser(2.3),4.9,.55)
add(whoosh(.6),6.95,.9);add(boom(),7.2,1.0)
for i,q in enumerate([1047,1319,1568,2093]): add(bell(q,1.3,.14),8.05+i*.08)
for t in [11.8,14.6,17.2]: add(whoosh(.45),t-.22,1.0);add(hat(.04),t,1.0)
for i in range(6): add(pop(700+i*120),14.6+i*.16+.1,.8)
for i in range(3): add(pop(1000+i*150),17.2+.75+i*.35,.8)
# fin
add(whoosh(.5),19.95,1.0);add(boom(),20.65,.9)
for i,q in enumerate([523,659,784,1047,1319]): add(bell(q,1.4,.14),20.75+i*.07)
for i in range(3): add(pop(1200+i*200),21.5+i*.6,.9)
add(bell(1568,1.0,.12),23.8)
fade=np.ones(N);fl=int(SR*1.0);fade[-fl:]=np.linspace(1,0,fl);out*=fade
out=out/np.max(np.abs(out))*0.85
st=np.stack([out,out],1)
with wave.open('sfx.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())
print('ok')
