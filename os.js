'use strict';
const VERSION='1.1.0';
const REPO='DEIN-NAME/mecon-os'; /* <- hier dein GitHub-Repo eintragen (Benutzer/Repo) */
const $=s=>document.querySelector(s),LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}};
const isDesk=()=>innerWidth>=768;
let accent=LS('accent')||'#0078d7';
function setAccent(c){accent=c;LS('accent',c);document.documentElement.style.setProperty('--n',c)}
setAccent(accent);

/* ---------- Status / Uhr / Sperrbildschirm ---------- */
let tick=function(){const d=new Date(),t=d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
$('#st-time').textContent=t;$('#lk-time').textContent=t;$('#lk-date').textContent=d.toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'})}
setInterval(()=>tick(),1000);
if(navigator.getBattery)navigator.getBattery().then(b=>{const u=()=>$('#st-bat').textContent=Math.round(b.level*100)+'%'+(b.charging?'⚡':'');u();b.onlevelchange=b.onchargingchange=u});
const lk=$('#lock'),unlock=()=>lk.classList.add('off');let ty=null;
lk.addEventListener('pointerdown',e=>{ty=e.clientY});
lk.addEventListener('pointerup',e=>{if(ty!==null)unlock();ty=null});
lk.addEventListener('click',unlock);
addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')unlock()});

/* ---------- Fenster-Manager ---------- */
const wins={};let z=10,zc=0;
const APPS={settings:['Einstellungen','⚙',appSettings]};
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
function tile(cls,g,l,fn,html){const d=document.createElement('div');d.className='tile '+cls;d.innerHTML=html||`<span class="g">${g}</span><span class="l">${l}</span>`;d.onclick=fn;$('#tiles').append(d);return d}
const ct=tile('w','','',()=>{},'<span class="l" id="t-d"></span><span class="big" id="t-t"></span>');ct.style.cursor='default';
tile('','⚙','Einstellungen',()=>openApp('settings'));
tile('d','⭳','System-Update',()=>openApp('settings'));
tile('d','▣','App installieren',()=>standalone()?alert('Mecon OS läuft bereits als App.'):doInstall());
const _tk=tick;tick=function(){_tk();const d=new Date();$('#t-t').textContent=d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});$('#t-d').textContent=d.toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'})};tick();

/* ---------- Einstellungen + Update ---------- */
let deferred;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(!standalone()&&matchMedia('(max-width:767px)').matches&&!LS('noinst'))$('#install').classList.remove('hide')});
const standalone=()=>matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches||navigator.standalone;
async function doInstall(){if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;$('#install').classList.add('hide')}else $('#i-hint').textContent='Browser-Menü (⋮) → „Zum Startbildschirm hinzufügen“ / „App installieren“.'}
$('#i-yes').onclick=doInstall;$('#i-no').onclick=()=>{LS('noinst','1');$('#install').classList.add('hide')};
if(!standalone()&&matchMedia('(max-width:767px)').matches&&!LS('noinst')&&!/Chrome/.test(navigator.userAgent))$('#install').classList.remove('hide');
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});
const newer=(a,b)=>{a=a.replace(/^v/,'').split('.').map(Number);b=b.split('.').map(Number);for(let i=0;i<3;i++){if((a[i]||0)>(b[i]||0))return 1;if((a[i]||0)<(b[i]||0))return 0}return 0};
function appSettings(b){
 b.innerHTML=`<h2>Einstellungen</h2><h3>Farbe</h3><div id="sws"></div>
 <h3>System-Update</h3><div class="row"><span>Installierte Version</span><b>${VERSION}</b></div>
 <p><button class="btn acc" id="chk">Nach Updates suchen</button></p><div id="up" class="small"></div>
 <h3>App</h3><button class="btn" id="ins">Als App installieren</button><div class="small">Mecon OS ${VERSION}</div>`;
 const sw=b.querySelector('#sws');
 ['#0078d7','#00b294','#00cc6a','#e3008c','#e81123','#ff8c00','#ffb900','#8764b8','#767676'].forEach(c=>{const s=document.createElement('span');s.className='sw'+(c===accent?' on':'');s.style.background=c;s.onclick=()=>{setAccent(c);sw.querySelectorAll('.sw').forEach(x=>x.classList.remove('on'));s.classList.add('on')};sw.append(s)});
 b.querySelector('#ins').onclick=()=>standalone()?alert('Mecon OS läuft bereits als App.'):doInstall();
 const up=b.querySelector('#up');
 b.querySelector('#chk').onclick=async()=>{up.textContent='Suche…';
  try{const res=await fetch('https://api.github.com/repos/'+REPO+'/releases/latest',{headers:{Accept:'application/vnd.github+json'}});if(!res.ok)throw res.status;const j=await res.json();
   if(newer(j.tag_name,VERSION)){const a=j.assets&&j.assets[0],url=a?a.browser_download_url:j.zipball_url;
    up.innerHTML=`<b style="color:var(--n)">Update verfügbar: ${j.tag_name}</b><br>${(j.body||'').slice(0,300).replace(/</g,'&lt;')}<br><a class="btn acc" href="${url}" target="_blank" rel="noopener">Herunterladen</a><button class="btn" id="ap">Jetzt anwenden</button>`;
    up.querySelector('#ap').onclick=applyUpdate}
   else up.textContent='Mecon OS ist aktuell ✓';}catch(e){up.textContent='Prüfung fehlgeschlagen ('+e+').'}}}
async function applyUpdate(){try{(await caches.keys()).forEach(k=>caches.delete(k));(await navigator.serviceWorker.getRegistrations()).forEach(r=>r.unregister())}catch(e){}location.reload(true)}
