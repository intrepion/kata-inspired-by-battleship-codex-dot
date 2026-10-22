'use strict';
const frame=document.getElementById('game'),results=document.getElementById('results');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
let assertions=0, groups=0;
function check(ok,message){assert(ok,message);assertions++;}
async function until(fn){for(let i=0;i<150;i++){if(fn())return;await wait(10);}throw Error('Timed out waiting for UI turn');}
document.getElementById('run').onclick=async()=>{
 const run=document.getElementById('run');run.disabled=true;results.replaceChildren();assertions=0;groups=0;
 const w=frame.contentWindow,d=w.document,E=w.Meridian,$=id=>d.getElementById(id),cell=(side,n)=>$(side+'-board').querySelector(`[data-index="${n}"]`);
 const click=id=>$(id).click();
 const reset=()=>{click('restart');click('confirm-restart');};
 const test=async(name,fn)=>{await fn();groups++;const li=document.createElement('li');li.textContent='PASS · '+name;results.append(li);};
 try{
 await test('Manual placement, invalid boundaries/overlap, rotation, keyboard navigation, movement, clear',async()=>{
 reset();const control=$('fleet').children[0];control.focus();cell('own',0).dispatchEvent(new w.PointerEvent('pointerenter'));check(d.activeElement===control&&$('fleet').children[0]===control,'Hover preserves fleet control and focus');check($('start').disabled,'Cannot launch empty fleet');cell('own',9).click();check($('own-count').textContent==='0 / 5 placed','Edge rejected');
 cell('own',0).click();cell('own',0).click();check($('own-count').textContent==='1 / 5 placed','Overlap rejected');
 cell('own',10).dispatchEvent(new w.KeyboardEvent('keydown',{key:'r',bubbles:true}));check($('orientation').textContent==='Vertical','R rotates');
 cell('own',10).click();cell('own',11).dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));check(d.activeElement===cell('own',12),'Arrow moves focus');
 click('clear');for(const n of [0,2,4,6,8])cell('own',n).click();check(!$('start').disabled,'Five vertical ships placed');
 $('fleet').children[0].click();cell('own',1).click();check($('own-count').textContent==='5 / 5 placed','Move keeps exactly five ships');
 click('clear');check($('own-count').textContent==='0 / 5 placed','Clear returns to empty');
 });
 await test('Alternation, rapid repeated input lock, no concealed rival ship markers, restart cancels pending turn',async()=>{
 click('shuffle');click('start');check($('fog').hidden,'Fog cleared');check(!d.querySelector('#enemy-board .ship'),'Rival ships concealed');
 cell('enemy',0).click();cell('enemy',1).click();cell('enemy',0).click();check(d.querySelectorAll('#enemy-board .hit,#enemy-board .miss,#enemy-board .sunk').length===1,'Only one shot while computer pending');
 cell('enemy',2).dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',repeat:true,bubbles:true,cancelable:true}));
 reset();await wait(800);check($('phase').textContent.includes('DEPLOYMENT'),'Restart survives old callback');check(!d.querySelector('#own-board .hit,#own-board .miss'),'No stale computer shot');
 });
 // Speed only the iframe's ordinary UI delay. The rules and AI remain unchanged.
 const nativeTimeout=w.setTimeout.bind(w);w.setTimeout=(fn,ms,...args)=>nativeTimeout(fn,ms===650?1:ms,...args);
 const prepare=seed=>{reset();w.Math.random=E.seeded(seed);const oracle=E.seeded(seed);E.randomFleet(oracle);const rival=E.randomFleet(oracle);click('shuffle');click('start');return rival;};
 await test('Full UI match to victory, sunk fleets, post-game input lock, restart',async()=>{
 const rival=prepare(81);for(const n of rival.ships.flatMap(s=>s.cells)){cell('enemy',n).click();await until(()=>$('phase').textContent.includes('YOUR TURN')||$('phase').textContent.includes('COMPLETE'));}
 check($('status').textContent.startsWith('Victory'),'Victory visible');check($('enemy-count').textContent==='0 afloat','All five sunk');
 const log=$('log').textContent;cell('enemy',99).click();check($('log').textContent===log,'Post-game shots ignored');reset();check($('own-count').textContent==='0 / 5 placed','Victory restart clean');
 });
 await test('Full UI match to loss and restart',async()=>{
 const rival=prepare(25);const occupied=new Set(rival.ships.flatMap(s=>s.cells));
 for(let n=0;n<100&& !$('phase').textContent.includes('COMPLETE');n++){if(occupied.has(n))continue;cell('enemy',n).click();await until(()=>$('phase').textContent.includes('YOUR TURN')||$('phase').textContent.includes('COMPLETE'));}
 check($('status').textContent.startsWith('Fleet lost'),'Loss visible');check($('own-count').textContent==='0 afloat','Own fleet sunk');reset();
 });
 await test('Mobile 360px layout, touch event path, help and restart cancellation',async()=>{
 frame.style.width='360px';await wait(50);check(d.documentElement.scrollWidth<=360,'No horizontal overflow at 360px');
 const el=cell('own',0);el.dispatchEvent(new w.PointerEvent('pointerdown',{pointerType:'touch',bubbles:true}));el.dispatchEvent(new w.PointerEvent('pointerup',{pointerType:'touch',bubbles:true}));el.click();check($('own-count').textContent==='1 / 5 placed','Touch selection places ship');
 click('help');check($('help-dialog').open,'Instructions open');$('help-dialog').querySelector('[data-close]').click();click('restart');click('cancel-restart');check($('own-count').textContent==='1 / 5 placed','Cancel preserves progress');reset();
 });
 const li=document.createElement('li');li.textContent=`COMPLETE · ${groups} groups passed · ${assertions} assertions`;results.append(li);document.title='PASS · Quiet Meridian browser checks';
 }catch(error){const li=document.createElement('li');li.textContent='FAIL · '+error.message;results.append(li);document.title='FAIL · Quiet Meridian browser checks';console.error(error);}
 finally{run.disabled=false;}
};
