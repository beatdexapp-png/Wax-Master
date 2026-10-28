import numpy as np, wave, sys
exec(open("../vid6/audio_sfx.py").read().split("TB=3*BEAT")[0].replace("DUR=21.0","DUR=40.0"))
D=[5.42,2.19,4.85,2.87,5.94,3.34,2.15,2.92,2.79,5.08];T=np.cumsum([0]+D)
N=int(SR*T[-1]);out=np.zeros(N)
BOOM=float(sys.argv[1]) if len(sys.argv)>1 else 2.0
add(riser(BOOM-.1),0.1,.12);add(boom(),BOOM,.55);add(hat(.04),BOOM,1.0)
add(boom(),T[1],.3)
for t in T[2:]: add(whoosh(.4),t-.2,.45)
fade=np.ones(N);fl=int(SR*1.0);fade[-fl:]=np.linspace(1,0,fl);out*=fade
out=out/np.max(np.abs(out))*0.5
st=np.stack([out,out],1)
with wave.open('sfx2.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())
print('ok',len(out)/SR)
