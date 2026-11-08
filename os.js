'use strict';
const VERSION='1.0.1';
const $=s=>document.querySelector(s),LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}};
const isDesk=()=>innerWidth>=768;
let accent=LS('accent')||'#00f0ff';
function setAccent(c){accent=c;LS('accent',c);const r=document.documentElement.style;r.setProperty('--n',c);r.setProperty('--nd',c+'29');r.setProperty('--ns',c+'80');document.querySelector('meta[name=theme-color]').content='#080e20'}
setAccent(accent);

/* ---------- Status / Uhr / Sperrbildschirm ---------- */
function tick(){const d=new Date(),t=d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
$('#st-time').textContent=t;$('#lk-time').textContent=t;$('#lk-date').textContent=d.toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'})}
setInterval(tick,1000);tick();
if(navigator.getBattery)navigator.getBattery().then(b=>{const u=()=>$('#st-bat').textContent=Math.round(b.level*100)+'%'+(b.charging?'⚡':'');u();b.onlevelchange=b.onchargingchange=u});
const lk=$('#lock'),unlock=()=>lk.classList.add('off');let ty=null;
lk.addEventListener('pointerdown',e=>{ty=e.clientY});
lk.addEventListener('pointerup',e=>{if(ty!==null)unlock();ty=null});
lk.addEventListener('click',unlock);
addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')unlock()});

/* ---------- Fenster-Manager ---------- */
const wins={};let z=10,zc=0;
const APPS={
 calc:['Rechner','🧮',appCalc],notes:['Notizen','📝',appNotes],clock:['Uhr','⏰',appClock],
 paint:['Zeichnen','🎨',appPaint],snake:['Snake','🐍',appSnake],term:['Terminal','⌨️',appTerm],settings:['Einstellungen','⚙️',appSettings]};
function openApp(id){
 if(wins[id]){showWin(id);return}
 const [name,,fn]=APPS[id],w=document.createElement('div');w.className='win';
 w.innerHTML=`<div class="tb"><span>${name}</span><span><button class="m">–</button><button class="x">✕</button></span></div><div class="body"></div>`;
 if(isDesk()){const o=zc++%6*28;Object.assign(w.style,{left:60+o+'px',top:30+o+'px',width:'min(720px,80%)',height:'min(520px,75%)'})}
 $('#wins').append(w);wins[id]={el:w,name};
 w.querySelector('.x').onclick=()=>closeWin(id);w.querySelector('.m').onclick=()=>w.classList.add('min');
 w.addEventListener('pointerdown',()=>w.style.zIndex=++z);
 dragWin(w,w.querySelector('.tb'));fn(w.querySelector('.body'),w);showWin(id);
}
function showWin(id){Object.values(wins).forEach(x=>{if(x.el!==wins[id].el&&!isDesk())x.el.classList.add('min')});
 wins[id].el.classList.remove('min');wins[id].el.style.zIndex=++z;$('#recents').classList.add('hide')}
function closeWin(id){const w=wins[id];if(!w)return;w.el.remove();w.el.dispatchEvent(new Event('close'));delete wins[id]}
function home(){Object.values(wins).forEach(x=>x.el.classList.add('min'));$('#recents').classList.add('hide')}
function dragWin(w,h){let sx,sy,ox,oy,on=0;h.addEventListener('pointerdown',e=>{if(e.target.tagName==='BUTTON')return;on=1;sx=e.clientX;sy=e.clientY;ox=w.offsetLeft;oy=w.offsetTop;h.setPointerCapture(e.pointerId)});
 h.addEventListener('pointermove',e=>{if(on){w.style.left=ox+e.clientX-sx+'px';w.style.top=Math.max(0,oy+e.clientY-sy)+'px'}});h.addEventListener('pointerup',()=>on=0)}
const topWin=()=>Object.keys(wins).filter(k=>!wins[k].el.classList.contains('min')).sort((a,b)=>wins[b].el.style.zIndex-wins[a].el.style.zIndex)[0];
$('#n-home').onclick=home;
$('#n-back').onclick=()=>{const t=topWin();if(t)closeWin(t);else $('#recents').classList.add('hide')};
$('#n-rec').onclick=()=>{const r=$('#recents');r.innerHTML='';const ks=Object.keys(wins);
 if(!ks.length)r.innerHTML='<p class="small">Keine geöffneten Apps.</p>';
 ks.forEach(k=>{const d=document.createElement('div');d.className='rc';d.innerHTML=`<b>${APPS[k][1]} ${wins[k].name}</b><button class="btn">✕</button>`;
  d.onclick=()=>showWin(k);d.querySelector('button').onclick=e=>{e.stopPropagation();closeWin(k);d.remove()};r.append(d)});r.classList.toggle('hide')};
Object.entries(APPS).forEach(([id,[n,i]])=>{const d=document.createElement('div');d.className='ic';d.innerHTML=`<i>${i}</i><span>${n}</span>`;d.onclick=()=>openApp(id);$('#desk').append(d)});

/* ---------- Apps ---------- */
function appCalc(b){let e='';b.innerHTML='<div class="disp">0</div><div class="calc"></div>';const d=b.querySelector('.disp'),g=b.querySelector('.calc');
 '7 8 9 / 4 5 6 * 1 2 3 - C 0 . + ( ) % ⌫ ='.split(' ').forEach(k=>{const x=document.createElement('button');x.className='btn';x.textContent=k;x.onclick=()=>{
  if(k==='C')e='';else if(k==='⌫')e=e.slice(0,-1);else if(k==='='){try{if(/^[\d+\-*/().% ]+$/.test(e))e=String(+Function('"use strict";return('+e+')')().toFixed(10));}catch(_){e='Fehler'}}else e+=k;d.textContent=e||'0'};g.append(x)})}
function appNotes(b){b.style.padding='10px';b.innerHTML='<textarea placeholder="Notiz schreiben…"></textarea>';const t=b.firstChild;t.value=LS('notes')||'';t.oninput=()=>LS('notes',t.value)}
function appClock(b,w){b.innerHTML='<div class="big" id="ck">00:00:00</div><h3>Stoppuhr</h3><div class="big" id="sw" style="font-size:38px">0.00</div><div style="text-align:center"><button class="btn" id="s1">Start</button><button class="btn" id="s2">Reset</button></div>';
 const ck=b.querySelector('#ck'),sw=b.querySelector('#sw');let t0=0,acc=0,run=0;
 const iv=setInterval(()=>{ck.textContent=new Date().toLocaleTimeString('de-DE');sw.textContent=((acc+(run?Date.now()-t0:0))/1000).toFixed(2)},50);
 b.querySelector('#s1').onclick=e=>{if(run){acc+=Date.now()-t0;run=0;e.target.textContent='Start'}else{t0=Date.now();run=1;e.target.textContent='Stopp'}};
 b.querySelector('#s2').onclick=()=>{acc=0;run=0;t0=Date.now();b.querySelector('#s1').textContent='Start'};w.addEventListener('close',()=>clearInterval(iv))}
function appPaint(b){b.style.padding='8px';b.innerHTML='<button class="btn">Löschen</button><input type="color" style="width:60px;padding:2px;height:40px"><br><canvas></canvas>';
 const c=b.querySelector('canvas'),x=c.getContext('2d'),col=b.querySelector('input');c.width=Math.min(innerWidth-36,700);c.height=Math.min(innerHeight*.55,420);col.value=accent;
 let on=0;const p=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
 c.onpointerdown=e=>{on=1;x.beginPath();x.moveTo(...p(e));c.setPointerCapture(e.pointerId)};
 c.onpointermove=e=>{if(!on)return;x.strokeStyle=col.value;x.lineWidth=4;x.lineCap='round';x.shadowColor=col.value;x.shadowBlur=8;x.lineTo(...p(e));x.stroke()};c.onpointerup=()=>on=0;
 b.querySelector('button').onclick=()=>x.clearRect(0,0,c.width,c.height)}
function appSnake(b,w){b.innerHTML='<div class="small" id="sc">Punkte: 0 – wischen oder Pfeiltasten</div><canvas width="300" height="300"></canvas>';
 const c=b.querySelector('canvas'),x=c.getContext('2d'),N=15,S=20;let s,d,f,sc,dead;
 const rs=()=>{s=[[7,7],[6,7]];d=[1,0];f=[10,4];sc=0;dead=0};rs();
 const iv=setInterval(()=>{if(dead)return;const h=[s[0][0]+d[0],s[0][1]+d[1]];
  if(h[0]<0||h[1]<0||h[0]>=N||h[1]>=N||s.some(q=>q[0]==h[0]&&q[1]==h[1])){dead=1;b.querySelector('#sc').textContent='Game Over ('+sc+') – tippen für Neustart';return}
  s.unshift(h);if(h[0]==f[0]&&h[1]==f[1]){sc++;f=[Math.random()*N|0,Math.random()*N|0];b.querySelector('#sc').textContent='Punkte: '+sc}else s.pop();
  x.fillStyle='#000';x.fillRect(0,0,300,300);x.shadowBlur=10;x.shadowColor=accent;x.fillStyle=accent;s.forEach(q=>x.fillRect(q[0]*S+1,q[1]*S+1,S-2,S-2));x.fillStyle='#ff2bd6';x.shadowColor='#ff2bd6';x.fillRect(f[0]*S+2,f[1]*S+2,S-4,S-4)},140);
 const dir=(a,b2)=>{if(a&&d[0]==-a[0]&&d[1]==-a[1])return;d=a};
 let sx,sy;c.ontouchstart=e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;if(dead)rs()};
 c.ontouchmove=e=>{const dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;if(Math.abs(dx)+Math.abs(dy)<20)return;dir(Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)]);sx=e.touches[0].clientX;sy=e.touches[0].clientY};
 const kd=e=>{const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(m)dir(m)};addEventListener('keydown',kd);
 w.addEventListener('close',()=>{clearInterval(iv);removeEventListener('keydown',kd)})}
function appTerm(b){b.innerHTML='<div class="term" id="o">Mecon OS Terminal v'+VERSION+'\nTippe "help".\n</div><input placeholder="> " autocapitalize="off" autocomplete="off">';
 const o=b.querySelector('#o'),i=b.querySelector('input');
 const C={help:()=>'help, date, ver, clear, apps, open <app>, echo <text>, accent <#hex>',date:()=>new Date().toString(),ver:()=>'Mecon OS '+VERSION,apps:()=>Object.keys(APPS).join(' '),
  clear:()=>{o.textContent='';return''},echo:a=>a,open:a=>APPS[a]?(openApp(a),'öffne '+a):'Unbekannte App',accent:a=>/^#[0-9a-f]{6}$/i.test(a)?(setAccent(a),'ok'):'Format: #00f0ff'};
 i.onkeydown=e=>{if(e.key!=='Enter')return;const[m,...r]=i.value.trim().split(' ');o.textContent+='> '+i.value+'\n'+(m?(C[m]?C[m](r.join(' ')):'Unbekannter Befehl'):'')+'\n';i.value='';b.scrollTop=1e9}}

/* ---------- Einstellungen + Update ---------- */
let deferred;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(!standalone()&&matchMedia('(max-width:767px)').matches&&!LS('noinst'))$('#install').classList.remove('hide')});
const standalone=()=>matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches||navigator.standalone;
async function doInstall(){if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;$('#install').classList.add('hide')}else $('#i-hint').textContent='Browser-Menü (⋮) → „Zum Startbildschirm hinzufügen“ / „App installieren“.'}
$('#i-yes').onclick=doInstall;$('#i-no').onclick=()=>{LS('noinst','1');$('#install').classList.add('hide')};
if(!standalone()&&matchMedia('(max-width:767px)').matches&&!LS('noinst')&&!/Chrome/.test(navigator.userAgent))$('#install').classList.remove('hide');
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});
const newer=(a,b)=>{a=a.replace(/^v/,'').split('.').map(Number);b=b.split('.').map(Number);for(let i=0;i<3;i++){if((a[i]||0)>(b[i]||0))return 1;if((a[i]||0)<(b[i]||0))return 0}return 0};
function appSettings(b){const repo=LS('repo')||'DEIN-NAME/mecon-os';
 b.innerHTML=`<h3>Design</h3><div id="sws"></div>
 <h3>System-Update</h3><div class="row"><span>Installierte Version</span><b>${VERSION}</b></div>
 <div class="small">GitHub-Repository (Benutzer/Repo):</div><input id="rp" value="${repo}" autocapitalize="off">
 <p><button class="btn" id="chk">Nach Updates suchen</button></p><div id="up" class="small"></div>
 <h3>App</h3><button class="btn" id="ins">Als App installieren</button><div class="small">Mecon OS ${VERSION} · Neon-Design</div>`;
 ['#00f0ff','#2d7bff','#9b5cff','#ff2bd6','#ff2d55','#ff8a00','#ffe600','#39ff14'].forEach(c=>{const s=document.createElement('span');s.className='sw';s.style.background=c;s.onclick=()=>setAccent(c);b.querySelector('#sws').append(s)});
 b.querySelector('#ins').onclick=()=>standalone()?alert('Mecon OS läuft bereits als App.'):doInstall();
 const up=b.querySelector('#up');
 b.querySelector('#chk').onclick=async()=>{const r=b.querySelector('#rp').value.trim();LS('repo',r);up.textContent='Suche…';
  try{const res=await fetch('https://api.github.com/repos/'+r+'/releases/latest',{headers:{Accept:'application/vnd.github+json'}});if(!res.ok)throw res.status;const j=await res.json();
   if(newer(j.tag_name,VERSION)){const a=j.assets&&j.assets[0],url=a?a.browser_download_url:j.zipball_url;
    up.innerHTML=`<b style="color:var(--n)">Update verfügbar: ${j.tag_name}</b><br>${(j.body||'').slice(0,300).replace(/</g,'&lt;')}<br><a class="btn" style="display:inline-block;text-decoration:none" href="${url}" target="_blank" rel="noopener">Herunterladen</a><button class="btn" id="ap">Jetzt anwenden</button>`;
    up.querySelector('#ap').onclick=applyUpdate}
   else up.textContent='Mecon OS ist aktuell ✓';}catch(e){up.textContent='Prüfung fehlgeschlagen ('+e+'). Repo-Name und Internet prüfen.'}}}
async function applyUpdate(){try{(await caches.keys()).forEach(k=>caches.delete(k));(await navigator.serviceWorker.getRegistrations()).forEach(r=>r.unregister())}catch(e){}location.reload(true)}
