import numpy as np, wave
SR=44100;DUR=21.0;N=int(SR*DUR);out=np.zeros(N)
BEAT=60/140;T=[0,5*BEAT,10*BEAT,17*BEAT,23*BEAT,30*BEAT,35*BEAT,42*BEAT]
rng=np.random.default_rng(7)
def add(sig,t0,g=1.0):
    i=int(t0*SR);
    if i>=N:return
    j=min(N,i+len(sig));out[i:j]+=sig[:j-i]*g
def env(n,a=0.002,d=0.2):
    t=np.arange(n)/SR;e=np.minimum(1,t/max(a,1e-4))*np.exp(-t/d);return e
def kick(d=0.35):
    n=int(SR*d);t=np.arange(n)/SR;f=45+120*np.exp(-t*30);ph=2*np.pi*np.cumsum(f)/SR;return np.sin(ph)*np.exp(-t*7)*1.0
def clap():
    n=int(SR*.25);t=np.arange(n)/SR;nz=rng.standard_normal(n);
    from numpy.fft import rfft,irfft
    e=np.exp(-t*25)*(1+0.6*np.exp(-((t-.012)**2)/1e-5))
    sig=nz*e;F=rfft(sig);fr=np.fft.rfftfreq(n,1/SR);F*=np.exp(-((fr-1500)/1200)**2);return irfft(F,n)*3.0
def hat(d=.05):
    n=int(SR*d);nz=rng.standard_normal(n);nz=np.diff(np.concatenate([[0],nz]));return nz*np.exp(-np.arange(n)/SR*60)*.25
def sub808(f0,d,f1=None):
    n=int(SR*d);t=np.arange(n)/SR;f=f0 if f1 is None else f0+(f1-f0)*np.minimum(1,t/.12);ph=2*np.pi*np.cumsum(np.full(n,f) if np.isscalar(f) else f)/SR
    s=np.sin(ph)+.25*np.sin(2*ph);return np.tanh(1.6*s)*np.minimum(1,t/.005)*np.exp(-t/ (d*.8))*.55
def bell(f,d=.6,g=.18):
    n=int(SR*d);t=np.arange(n)/SR;s=np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*f*2.01*t)*np.exp(-t*8)+.3*np.sin(2*np.pi*f*3.0*t)*np.exp(-t*12);return s*np.exp(-t*5)*g
def riser(d):
    n=int(SR*d);t=np.arange(n)/SR;nz=rng.standard_normal(n)
    # bruit filtré qui monte + sinus qui monte
    k=np.linspace(0,1,n);lp=np.zeros(n);a=0.0;y=0.0
    for i in range(0,n,64):
        a=0.02+0.5*k[i]**2
        seg=nz[i:i+64];o=np.empty_like(seg)
        for j,v in enumerate(seg):y+=a*(v-y);o[j]=y
        lp[i:i+64]=o
    sw=np.sin(2*np.pi*np.cumsum(200+1800*k**3)/SR)*.15
    return (lp*.9+sw)*k**1.5
def boom():
    n=int(SR*2.2);t=np.arange(n)/SR;f=38+60*np.exp(-t*6);s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*1.6)
    nz=rng.standard_normal(n)*np.exp(-t*9)*.5;return np.tanh(2*(s+nz))*.9
def whoosh(d=.45):
    n=int(SR*d);t=np.arange(n)/SR;nz=rng.standard_normal(n);e=np.sin(np.pi*t/d)**2;return nz*e*.18
def chord(fs,d,g=.07):
    n=int(SR*d);t=np.arange(n)/SR;s=sum(np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*f*2*t) for f in fs);return s*np.minimum(1,t/.3)*np.exp(-t/(d*.6))*g
TB=3*BEAT;SEC=[12*BEAT,18*BEAT,23*BEAT,31*BEAT,37*BEAT];S8=42*BEAT
add(riser(TB),0,.6)
for k,tt in enumerate(np.cumsum([.3,.24,.19,.15,.12,.1,.08,.07,.06])):
    if tt<TB-.04:add(bell([220,262,330,392,440,523,587,659,784][k],.35,.12),tt)
add(boom(),TB,1.0);add(bell(1047,1.2,.3),TB+.45);add(bell(1319,1.2,.2),TB+.5)
for tt in SEC:add(whoosh(),tt-.3,1.0);add(hat(.04),tt,1.2)
for k in range(6):add(bell([523,587,659,784,880,1047][k],.5,.2),18*BEAT+k*BEAT*.66)
TALB=23*BEAT+(238-140)/36
add(boom(),TALB,.45);[add(bell(f,1.0,.18),TALB+i*.06) for i,f in enumerate([784,988,1175,1568])]
add(boom(),S8,.6)
fade=np.ones(N);fl=int(SR*1.0);fade[-fl:]=np.linspace(1,0,fl);out*=fade
out=out/np.max(np.abs(out))*0.89
st=np.stack([out,out],1)
with wave.open('sfx.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype('<i2').tobytes())
print('ok',len(out)/SR)
