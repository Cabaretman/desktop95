import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

function load(file, name) {
  const storage = new Map();
  const context = vm.createContext({ Math, Date, crypto:webcrypto, structuredClone, Event, localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},window:{dispatchEvent(){}} });
  vm.runInContext(fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8')+'\nglobalThis.result='+name,context);
  return context.result;
}
const games=load('game-models.js','desktopGames');

test('Minesweeper has a safe opening, ten mines, flood fill and a win',()=>{
  const game=games.mines(()=>.42);game.reveal(40);
  assert.equal(game.state.cells[40].mine,false);
  assert.equal(game.state.cells[40].count,0);
  assert.equal(game.state.cells.filter(c=>c.mine).length,10);
  assert(game.state.cells.filter(c=>c.open).length>1);
  game.state.cells.forEach((c,i)=>{if(!c.mine)game.reveal(i)});
  assert.equal(game.state.won,true);assert.equal(game.state.over,true);
});
test('Minesweeper flags block revealing and a mine ends the game',()=>{
  const game=games.mines(()=>.3);game.flag(0);game.reveal(0);assert.equal(game.state.started,false);
  game.flag(0);game.reveal(0);const mine=game.state.cells.findIndex(c=>c.mine);game.reveal(mine);
  assert.equal(game.state.over,true);assert.equal(game.state.won,false);
});
test('Solitaire deals all 52 cards and draw/undo/recycle conserve cards',()=>{
  const game=games.solitaire(()=>.38),state=game.state;
  assert.equal(state.stock.length,24);assert.equal(state.tableau.flat().length,28);
  assert.equal(new Set([...state.stock,...state.tableau.flat()].map(c=>c.suit+c.rank)).size,52);
  assert.equal(state.tableau.flat().filter(c=>c.up).length,7);
  game.draw();assert.equal(game.state.waste.length,1);game.undo();assert.equal(game.state.waste.length,0);
  for(let i=0;i<24;i++)game.draw();assert.equal(game.state.stock.length,0);game.draw();assert.equal(game.state.stock.length,24);assert(game.state.stock.every(c=>!c.up));
});
test('Solitaire validates runs, foundations and empty columns',()=>{
  const game=games.solitaire(),s=game.state;
  s.tableau=Array.from({length:7},()=>[]);s.waste=[];s.foundations=[[],[],[],[]];
  s.tableau[0]=[{rank:13,suit:'♠',up:true},{rank:12,suit:'♥',up:true}];
  assert.equal(game.move({type:'tableau',col:0,index:0},{type:'tableau',col:1}),true);
  assert.equal(game.move({type:'tableau',col:1,index:1},{type:'tableau',col:2}),false);
  s.waste.push({rank:1,suit:'♣',up:true});assert.equal(game.auto({type:'waste'}),true);
  s.waste.push({rank:2,suit:'♥',up:true});assert.equal(game.move({type:'waste'},{type:'foundation',col:0}),false);
  assert.equal(game.move({type:'tableau',col:1,index:0},{type:'foundation',col:1}),false);
});
test('Files support nesting, soft deletion, restore and duplicate protection',()=>{
  const files=load('filesystem.js','desktopFiles');
  const folder=files.create('documents','Test','folder'),file=files.create(folder.id,'Hello.txt','file','Hello');
  assert.equal(files.path(file.id),'C:\\My Documents\\Test\\Hello.txt');
  assert.throws(()=>files.create(folder.id,'hello.TXT'));
  assert.throws(()=>files.move(folder.id,folder.id));
  files.remove(folder.id);assert(files.hidden(file));assert.equal(files.trash().length,1);
  files.restore(folder.id);assert.equal(files.hidden(file),false);
  files.write(file.id,'Changed');assert.equal(files.get(file.id).content,'Changed');
  files.remove(folder.id);files.empty();assert.equal(files.get(file.id),undefined);assert(files.get('notes'));
});

function connection(fetcher) {
  const context=vm.createContext({URL,settings:{endpoint:'https://provider.example/v1/chat/completions',model:'test-model'},fetch:fetcher});
  vm.runInContext(fs.readFileSync(new URL('../public/connection.js',import.meta.url),'utf8')+';globalThis.connection=aiConnection',context);
  return context;
}
test('BYOK refuses missing keys and unsafe endpoints',()=>{
  const box=connection(()=>{throw Error('Unexpected network call')});
  assert.throws(()=>box.connection.validate(),/API key/);
  box.connection.setKey('test-secret');box.settings.endpoint='http://provider.example/chat';
  assert.throws(()=>box.connection.validate(),/HTTPS/);
  box.settings.endpoint='https://name:password@provider.example/chat';
  assert.throws(()=>box.connection.validate(),/embedded credentials/);
});
test('BYOK sends keys only to the configured provider and clears session keys',async()=>{
  const box=connection(async(url,options)=>{
    assert.equal(String(url),'https://provider.example/v1/chat/completions');
    assert.equal(options.headers.Authorization,'Bearer test-secret');
    assert.equal(options.credentials,'omit');
    assert.equal(JSON.parse(options.body).model,'test-model');
    return Response.json({choices:[{message:{content:'Hello'}}]});
  });
  box.connection.setKey('test-secret');assert.equal(box.connection.hasKey,true);
  assert.equal(await box.connection.send([{role:'user',content:'Hi'}]),'Hello');
  box.connection.clear();assert.equal(box.connection.hasKey,false);
  assert.throws(()=>box.connection.validate(),/API key/);
});
test('BYOK errors do not echo provider response bodies',async()=>{
  const box=connection(async()=>new Response('sensitive provider details',{status:401}));
  box.connection.setKey('test-secret');
  await assert.rejects(box.connection.send([{role:'user',content:'Hi'}]),/Provider returned HTTP 401/);
});
