import numpy as np, wave
exec(open("../vid6/audio_sfx.py").read().split("TB=3*BEAT")[0].replace("DUR=21.0","DUR=21.5"))
BEAT=60/140
LV=[.55,1.15,1.75,2.4,3.0]
add(riser(3.55),0.05,.5)
for i,t in enumerate(LV): add(bell([523,659,784,988,1175][i],.5,.25),t)
add(boom(),3.6,1.0);add(whoosh(.6),3.45,.9)
for i,q in enumerate([1047,1319,1568,2093]): add(bell(q,1.2,.14),5.0+i*.08)
# beat à partir de la carte
t0=4.95;nb=int((17.55-t0)/BEAT)
for k in range(nb):
    t=t0+k*BEAT
    if k%4 in (0,): add(kick(),t,.9)
    if k%8==6: add(kick(),t+BEAT/2,.7)
    if k%4==2: add(clap(),t,.55)
    for h in range(2): add(hat(.03),t+h*BEAT/2,.6 if h==0 else .35)
    if k%8==7: [add(hat(.02),t+BEAT*(.5+j/6),.3) for j in range(3)]
    if k%8 in (0,3): add(sub808([55,55,49,62][(k//8)%4],BEAT*1.8),t,.8)
for t in [8.4,11.8,14.6]: add(whoosh(.45),t-.22,1.0);add(hat(.04),t,1.0)
add(riser(1.0),16.6,.5);add(boom(),17.65,1.0)
for i,q in enumerate([523,659,784,1047,1319]): add(bell(q,1.4,.16),18.1+i*.07)
fade=np.ones(N);fl=int(SR*1.2);fade[-fl:]=np.linspace(1,0,fl);out*=fade
out=out/np.max(np.abs(out))*0.9
st=np.stack([out,out],1)
with wave.open('sfx.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())
print('ok')
