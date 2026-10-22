const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../engine.js');
test('placement stays in bounds and rejects overlap without mutation',()=>{
 const b=E.board(); assert.equal(E.place(b,0,8,false),false); assert.equal(b.ships.length,0);
 assert.equal(E.place(b,0,0,false),true); assert.equal(E.place(b,1,0,true),false);
 assert.equal(E.place(b,1,10,false),true); assert.equal(b.ships.length,2);
});
test('shots distinguish miss, hit and sinking; repeat shots are inert',()=>{
 const b=E.board();E.place(b,4,0,false);
 assert.deepEqual(E.fire(b,99),{index:99,result:'miss'});
 assert.equal(E.fire(b,0).result,'hit');assert.equal(E.fire(b,0),null);
 assert.deepEqual(E.fire(b,1),{index:1,result:'sunk',ship:4,sunkCells:[0,1]});
 assert.equal(E.fire(b,-1),null);assert.equal(b.shots.length,3);
});
test('battle requires full fleet, alternates even on hits and ends immediately',()=>{
 const m=E.match();assert.equal(E.start(m),false);m.player=E.randomFleet(E.seeded(1));assert.equal(E.start(m,E.seeded(2)),true);
 const hit=m.enemy.ships[0].cells[0];assert.equal(E.shoot(m,'player',hit).result,'hit');
 assert.equal(E.shoot(m,'player',99),null);assert.ok(E.shoot(m,'computer',99));
 for(const s of m.enemy.ships)for(const c of s.cells){if(m.enemy.shots.some(t=>t.index===c))continue;E.shoot(m,'player',c);if(m.phase==='battle')E.shoot(m,'computer',m.player.shots.length);}
 assert.equal(m.winner,'player');assert.equal(E.shoot(m,'computer',50),null);
});
test('100 seeded fleets and full fair-AI matches finish without duplicate shots',()=>{
 const outcomes=new Set();
 for(let seed=1;seed<=100;seed++){
 const rng=E.seeded(seed),m=E.match();m.player=E.randomFleet(rng);E.start(m,rng);
 for(const b of [m.player,m.enemy]){assert.equal(b.ships.length,5);assert.equal(new Set(b.ships.flatMap(s=>s.cells)).size,17);}
 let turns=0;while(m.phase==='battle'&&turns++<200){const side=m.turn;const b=side==='player'?m.enemy:m.player;const reports=E.knowledge(b);const before=JSON.stringify(reports);const shot=E.chooseShot(reports,rng);assert.equal(JSON.stringify(reports),before);assert.ok(E.shoot(m,side,shot));}
 assert.equal(m.phase,'over');outcomes.add(m.winner);for(const b of [m.player,m.enemy])assert.equal(new Set(b.shots.map(s=>s.index)).size,b.shots.length);
 }assert.deepEqual([...outcomes].sort(),['computer','player']);
});
test('AI hunts adjacent hits, follows alignment, never wraps rows or reads a board',()=>{
 assert.equal(E.chooseShot([{index:20,result:'hit'},{index:21,result:'hit'}],()=>0),22);
 for(let seed=1;seed<30;seed++)assert.ok([8,19].includes(E.chooseShot([{index:9,result:'hit'}],E.seeded(seed))));
 const reports=Object.freeze([{index:0,result:'miss'}]);assert.notEqual(E.chooseShot(reports,()=>0),0);
 assert.equal(E.chooseShot(Array.from({length:100},(_,index)=>({index,result:'miss'}))),null);
 const b=E.randomFleet(E.seeded(1));E.fire(b,0);const k=E.knowledge(b);k[0].index=55;assert.equal(b.shots[0].index,0);
});

test('fleet generation completes even with a constant random source',()=>{
 for(const value of [0,.5,.999999]){const b=E.randomFleet(()=>value);assert.equal(b.ships.length,5);assert.equal(new Set(b.ships.flatMap(s=>s.cells)).size,17);}
});
