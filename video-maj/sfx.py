import numpy as np, wave, json
exec(open("../vid6/audio_sfx.py").read().split("TB=3*BEAT")[0].replace("DUR=21.0","DUR=30.0"))
SEC=[6.6,1.3,2.1,2.7,3.0,2.4,2.3,2.3,2.6,3.6];T=np.cumsum([0]+SEC)
N=int(SR*T[-1]);out=np.zeros(N)
sp=1.35;f=lambda fr: fr/30/sp
for k,(fr,fq) in enumerate([(50,523),(75,659)]): add(bell(fq,.6,.22),f(fr))
add(riser(f(92)),0.2,.25)
add(hat(.04),f(88),2.0);add(boom(),f(100),1.0);add(whoosh(.5),f(100)-.1,.8)
for i,q in enumerate([1047,1319,1568]): add(bell(q,1.0,.16),f(118)+i*.07)
add(boom(),T[1],.8);add(bell(784,1.2,.2),T[1]+.05)
for t in T[2:-1]: add(whoosh(),t-.25,1.0);add(hat(.04),t,1.2)
for i,q in enumerate([523,659,784,1047]): add(bell(q,.8,.15),T[-2]+.3+i*.08)
add(boom(),T[-2],.7)
fade=np.ones(N);fl=int(SR*1.0);fade[-fl:]=np.linspace(1,0,fl);out*=fade
out=out/np.max(np.abs(out))*0.89
st=np.stack([out,out],1)
with wave.open('sfx.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())
print('ok',len(out)/SR)
