/* Pure game rules. The opponent's strategy accepts shot reports only. */
(function(root){
'use strict';
const FLEET=[{name:'Carrier',size:5},{name:'Battleship',size:4},{name:'Cruiser',size:3},{name:'Submarine',size:3},{name:'Patrol boat',size:2}];
const valid=n=>Number.isInteger(n)&&n>=0&&n<100;
function board(){return {ships:[],shots:[]};}
function cells(id,start,vertical){
 if(!FLEET[id]||!valid(start)) return [];
 const n=FLEET[id].size;
 if((vertical?Math.floor(start/10):start%10)+n>10)return [];
 return Array.from({length:n},(_,i)=>start+i*(vertical?10:1));
}
function place(b,id,start,vertical){
 const c=cells(id,start,vertical);
 if(!c.length||b.ships.some(s=>s.id===id||s.cells.some(x=>c.includes(x))))return false;
 b.ships.push({id,cells:c});return true;
}
function randomFleet(rng=Math.random){
 for(let attempt=0;attempt<32;attempt++){
 const b=board();
 for(let id=0;id<5;id++){
 const occupied=new Set(b.ships.flatMap(s=>s.cells)),options=[];
 for(let n=0;n<100;n++)for(const vertical of [false,true]){
 const c=cells(id,n,vertical);
 if(c.length&&!c.some(x=>occupied.has(x)))options.push({n,vertical});
 }
 if(!options.length)break;
 const option=options[Math.min(options.length-1,Math.max(0,Math.floor(rng()*options.length)))];
 if(!option)throw new Error('Random source must return a finite number from 0 to 1.');
 place(b,id,option.n,option.vertical);
 }
 if(b.ships.length===5)return b;
 }
 throw new Error('Unable to arrange fleet after 32 attempts.');
}
function fire(b,index){
 if(!valid(index)||b.shots.some(s=>s.index===index))return null;
 const ship=b.ships.find(s=>s.cells.includes(index));
 const shot={index,result:ship?'hit':'miss'};
 b.shots.push(shot);
 if(ship&&ship.cells.every(c=>b.shots.some(s=>s.index===c))){shot.result='sunk';shot.ship=ship.id;shot.sunkCells=[...ship.cells];}
 return {...shot,...(shot.sunkCells?{sunkCells:[...shot.sunkCells]}:{})};
}
const defeated=b=>b.ships.length===5&&b.ships.every(s=>s.cells.every(c=>b.shots.some(t=>t.index===c)));
function match(){return {phase:'placement',player:board(),enemy:board(),turn:'player',winner:null};}
function start(m,rng=Math.random){if(m.phase!=='placement'||m.player.ships.length!==5)return false;m.enemy=randomFleet(rng);m.phase='battle';return true;}
function shoot(m,side,index){
 if(m.phase!=='battle'||m.turn!==side)return null;
 const target=side==='player'?m.enemy:m.player;
 const result=fire(target,index);if(!result)return null;
 if(defeated(target)){m.phase='over';m.winner=side;}else m.turn=side==='player'?'computer':'player';
 return result;
}
function knowledge(b){return b.shots.map(s=>({...s,...(s.sunkCells?{sunkCells:[...s.sunkCells]}:{})}));}
function chooseShot(reports,rng=Math.random){
 const tried=new Set(reports.map(s=>s.index));
 const sunk=new Set(reports.flatMap(s=>s.sunkCells||[]));
 const hits=reports.filter(s=>s.result==='hit'&&!sunk.has(s.index)).map(s=>s.index);
 const candidates=[];
 for(const h of hits)for(const d of [-10,10,-1,1]){
 const n=h+d;if(!valid(n)||tried.has(n)||(Math.abs(d)===1&&Math.floor(n/10)!==Math.floor(h/10)))continue;
 let score=1;
 if(hits.includes(h-d))score+=5;
 candidates.push({n,score});
 }
 if(candidates.length){const max=Math.max(...candidates.map(c=>c.score));const best=candidates.filter(c=>c.score===max);return best[Math.floor(rng()*best.length)].n;}
 let pool=Array.from({length:100},(_,i)=>i).filter(i=>!tried.has(i));
 const parity=pool.filter(i=>(Math.floor(i/10)+i%10)%2===0);if(parity.length)pool=parity;
 return pool.length?pool[Math.floor(rng()*pool.length)]:null;
}
function seeded(seed){let s=seed>>>0;return()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
const api={FLEET,board,cells,place,randomFleet,fire,defeated,match,start,shoot,knowledge,chooseShot,seeded};
if(typeof module!=='undefined')module.exports=api;else root.Meridian=api;
})(typeof window!=='undefined'?window:globalThis);
