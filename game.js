(function(){
'use strict';
const E=window.Meridian,$=id=>document.getElementById(id),coord=n=>String.fromCharCode(65+Math.floor(n/10))+(n%10+1);
let m=E.match(),selected=0,vertical=false,hover=null,timer=null,epoch=0,focus={own:0,enemy:0},history=[];
const nodes={own:[],enemy:[]};
for(const side of ['own','enemy']){
 const grid=$(side+'-board');
 for(let r=-1;r<10;r++)for(let c=-1;c<10;c++){
 if(r===-1||c===-1){const label=document.createElement('span');label.className='axis'+(r===-1?' top':'');label.setAttribute('aria-hidden','true');label.textContent=r===-1?(c===-1?'':c+1):String.fromCharCode(65+r);grid.append(label);continue;}
 const n=r*10+c,b=document.createElement('button');b.className='cell';b.type='button';b.dataset.index=n;b.tabIndex=n===0?0:-1;
 b.addEventListener('click',()=>activate(side,n));
 b.addEventListener('pointerenter',()=>{if(side==='own'&&m.phase==='placement'){hover=n;paint();}});
 b.addEventListener('pointerleave',()=>{if(hover===n){hover=null;paint();}});
 b.addEventListener('focus',()=>{focus[side]=n;if(side==='own'&&m.phase==='placement'){hover=n;paint();}});
 b.addEventListener('keydown',event=>{
 if(event.repeat&&(event.key==='Enter'||event.key===' ')){event.preventDefault();return;}
 let next=n;const row=Math.floor(n/10),col=n%10;
 if(event.key==='ArrowRight')next=row*10+Math.min(9,col+1);
 else if(event.key==='ArrowLeft')next=row*10+Math.max(0,col-1);
 else if(event.key==='ArrowUp')next=Math.max(0,row-1)*10+col;
 else if(event.key==='ArrowDown')next=Math.min(9,row+1)*10+col;
 else if(event.key==='Home')next=row*10;
 else if(event.key==='End')next=row*10+9;
 else if(event.key.toLowerCase()==='r'&&m.phase==='placement'){event.preventDefault();rotate();return;}else return;
 event.preventDefault();focus[side]=next;nodes[side].forEach((el,i)=>el.tabIndex=i===next?0:-1);nodes[side][next].focus();
 });
 nodes[side].push(b);grid.append(b);
 }
}
// Stable controls preserve keyboard focus during chart previews.
E.FLEET.forEach((ship,id)=>{
 const b=document.createElement('button');
 b.innerHTML=`<span class="mini" aria-hidden="true">${'<i></i>'.repeat(ship.size)}</span>${ship.name}`;
 b.onclick=()=>{selected=id;hover=null;paint();status(`Place your ${ship.name} (${ship.size} cells).`);};
 $('fleet').append(b);
});
function status(text){$('status').textContent=text;}
function report(side,shot){const who=side==='player'?'You':'Rival';const result=shot.result==='sunk'?`sank the ${E.FLEET[shot.ship].name}`:shot.result==='hit'?'hit a ship':'missed';const text=`${who} · ${coord(shot.index)} · ${result}.`;history.unshift(text);$('log').replaceChildren(...history.slice(0,6).map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));return text;}
function activate(side,n){
 if(m.phase==='placement'&&side==='own'){
 const old=m.player.ships;const candidate={ships:old.filter(s=>s.id!==selected),shots:[]};
 if(!E.place(candidate,selected,n,vertical)){status('That ship does not fit. Try another square or rotate.');return;}
 m.player=candidate;const next=E.FLEET.findIndex((_,i)=>!m.player.ships.some(s=>s.id===i));
 if(next>=0){selected=next;status(`Place your ${E.FLEET[next].name} (${E.FLEET[next].size} cells).`);}else status('Fleet ready. Launch your mission when you are ready.');
 hover=null;paint();return;
 }
 if(side!=='enemy')return;
 const shot=E.shoot(m,'player',n);if(!shot)return;
 const text=report('player',shot);paint();
 if(m.phase==='over'){finish();return;}
 status(text+' Rival is plotting a course…');const version=epoch;
 timer=setTimeout(()=>{
 timer=null;if(version!==epoch||m.phase!=='battle')return;
 // The strategy receives only reports of its own earlier shots, never player ship cells.
 const index=E.chooseShot(E.knowledge(m.player));const answer=E.shoot(m,'computer',index);if(!answer)return;
 const response=report('computer',answer);paint();if(m.phase==='over')finish();else status(response+' Your turn — choose a rival square.');
 },650);
}
function finish(){status(m.winner==='player'?'Victory. You found every ship. The meridian is yours.':'Fleet lost. Your rival found every ship. A fresh chart awaits.');paint();}
function rotate(){vertical=!vertical;paint();status(`${E.FLEET[selected].name} rotated ${vertical?'vertically':'horizontally'}.`);}
function sunkIds(b){return new Set(b.shots.filter(s=>s.result==='sunk').map(s=>s.ship));}
function paint(){
 const setup=m.phase==='placement';$('phase').textContent=setup?'01 / DEPLOYMENT':m.phase==='over'?'03 / MISSION COMPLETE':m.turn==='player'?'02 / YOUR TURN':'02 / RIVAL TURN';
 $('placement-tools').hidden=!setup;$('own-fleet').hidden=setup;$('fog').hidden=!setup;
 $('start').disabled=m.player.ships.length!==5;$('orientation').textContent=vertical?'Vertical':'Horizontal';
 const lostOwn=sunkIds(m.player),lostEnemy=sunkIds(m.enemy);
 $('own-count').textContent=setup?`${m.player.ships.length} / 5 placed`:`${5-lostOwn.size} afloat`;$('enemy-count').textContent=`${5-lostEnemy.size} afloat`;
 let preview=[];let fits=false;
 if(setup&&hover!==null){preview=E.cells(selected,hover,vertical);fits=preview.length>0&&!m.player.ships.filter(s=>s.id!==selected).some(s=>s.cells.some(c=>preview.includes(c)));if(!preview.length)preview=[hover];}
 for(const side of ['own','enemy']){
 const b=side==='own'?m.player:m.enemy;const sunk=new Set(b.shots.flatMap(s=>s.sunkCells||[]));
 nodes[side].forEach((el,n)=>{
 const shot=b.shots.find(s=>s.index===n);const visibleShip=side==='own'||m.phase==='over';const occupied=visibleShip&&b.ships.some(s=>s.cells.includes(n));
 const kind=sunk.has(n)?'sunk':shot?(shot.result==='miss'?'miss':'hit'):occupied?'ship':'';
 el.className='cell '+kind+(preview.includes(n)&&side==='own'?' '+(fits?'preview':'invalid'):'')+(b.shots.at(-1)?.index===n?' last':'');
 el.textContent=kind==='hit'||kind==='sunk'?'×':kind==='miss'?'•':'';
 el.setAttribute('aria-label',`${side==='own'?'Your':'Rival'} ${coord(n)}: ${kind||'untried'}`);
 // aria-disabled preserves roving keyboard navigation through fired cells.
 el.setAttribute('aria-disabled',String(side==='enemy'?(m.phase!=='battle'||m.turn!=='player'||!!shot):!setup));
 el.disabled=side==='enemy'&&setup;el.tabIndex=n===focus[side]?0:-1;
 });
 }
 [...$('fleet').children].forEach((b,id)=>{
 const placed=m.player.ships.some(p=>p.id===id),ship=E.FLEET[id];
 b.className=(selected===id?'selected ':'')+(placed?'placed':'');
 b.setAttribute('aria-pressed',String(selected===id));
 b.setAttribute('aria-label',`${ship.name}, ${ship.size} cells, ${placed?'placed — select to move':'not placed'}`);
 });
 for(const [id,lost] of [['own-fleet',lostOwn],['enemy-fleet',lostEnemy]])$(id).replaceChildren(...E.FLEET.map((s,i)=>{const span=document.createElement('span');span.textContent=s.name+(lost.has(i)?' · sunk':'');span.className=lost.has(i)?'lost':'';return span;}));
}
function reset(){clearTimeout(timer);timer=null;epoch++;m=E.match();selected=0;vertical=false;hover=null;history=[];focus={own:0,enemy:0};$('log').innerHTML='<li>Your next move begins the story.</li>';paint();status('Place your Carrier (5 cells). Select a starting square.');}
$('rotate').onclick=rotate;
$('shuffle').onclick=()=>{m.player=E.randomFleet();hover=null;paint();status('Fleet ready. Launch your mission, or shuffle again.');};
$('clear').onclick=()=>{m.player=E.board();selected=0;hover=null;paint();status('Chart cleared. Place your Carrier (5 cells).');};
$('start').onclick=()=>{if(!E.start(m))return;hover=null;paint();status('Your turn. Choose a square in rival waters.');nodes.enemy[0].focus();};
$('restart').onclick=()=>{$('restart-dialog').showModal();};
$('cancel-restart').onclick=()=>{$('restart-dialog').close();};
$('confirm-restart').onclick=()=>{$('restart-dialog').close();reset();nodes.own[0].focus();};
$('help').onclick=()=>{$('help-dialog').showModal();};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
reset();
})();
