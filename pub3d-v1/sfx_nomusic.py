import numpy as np, wave
exec(open("../vid6/audio_sfx.py").read().split("TB=3*BEAT")[0].replace("DUR=21.0","DUR=21.5"))
BEAT=60/140
LV=[.55,1.15,1.75,2.4,3.0]
add(riser(3.55),0.05,.5)
for i,t in enumerate(LV): add(bell([523,659,784,988,1175][i],.5,.25),t)
add(boom(),3.6,1.0);add(whoosh(.6),3.45,.9)
for i,q in enumerate([1047,1319,1568,2093]): add(bell(q,1.2,.14),5.0+i*.08)
for t in [8.4,11.8,14.6]: add(whoosh(.45),t-.22,1.0);add(hat(.04),t,1.0)
add(riser(1.0),16.6,.5);add(boom(),17.65,1.0)
for i,q in enumerate([523,659,784,1047,1319]): add(bell(q,1.4,.16),18.1+i*.07)
fade=np.ones(N);fl=int(SR*1.2);fade[-fl:]=np.linspace(1,0,fl);out*=fade
out=out/np.max(np.abs(out))*0.9
st=np.stack([out,out],1)
with wave.open('sfx_nm.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())
print('ok')
