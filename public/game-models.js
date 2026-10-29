const desktopGames = (() => {
  function shuffle(items,random=Math.random){for(let i=items.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items}
  function mines(random=Math.random){
    const size=9,total=81,count=10;
    const state={cells:Array.from({length:total},()=>({mine:false,open:false,flag:false,count:0})),started:false,over:false,won:false};
    const neighbors=index=>{const row=Math.floor(index/size),col=index%size,result=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++)if((x||y)&&row+y>=0&&row+y<size&&col+x>=0&&col+x<size)result.push((row+y)*size+col+x);return result};
    function reveal(index){
      const cell=state.cells[index];if(state.over||cell.open||cell.flag)return;
      if(!state.started){const safe=new Set([index,...neighbors(index)]);shuffle(Array.from({length:total},(_,i)=>i).filter(i=>!safe.has(i)),random).slice(0,count).forEach(i=>state.cells[i].mine=true);state.cells.forEach((c,i)=>c.count=neighbors(i).filter(j=>state.cells[j].mine).length);state.started=true;}
      if(cell.mine){cell.open=true;state.over=true;return;}
      const stack=[index];while(stack.length){const i=stack.pop(),c=state.cells[i];if(c.open||c.flag||c.mine)continue;c.open=true;if(!c.count)stack.push(...neighbors(i));}
      if(state.cells.filter(c=>c.open).length===total-count){state.won=true;state.over=true;}
    }
    return {state,reveal,flag(index){if(!state.over&&!state.cells[index].open)state.cells[index].flag=!state.cells[index].flag;},remaining(){return count-state.cells.filter(c=>c.flag).length;}};
  }
  const red=card=>card.suit==='♥'||card.suit==='♦';
  function solitaire(random=Math.random){
    const deck=shuffle(['♠','♥','♣','♦'].flatMap(suit=>Array.from({length:13},(_,i)=>({suit,rank:i+1,up:false}))),random);
    let state={stock:[],waste:[],foundations:[[],[],[],[]],tableau:Array.from({length:7},()=>[]),moves:0};
    for(let col=0;col<7;col++){for(let i=0;i<=col;i++)state.tableau[col].push(deck.pop());state.tableau[col].at(-1).up=true;}
    state.stock=deck;const history=[];
    const pile=source=>source.type==='waste'?state.waste:source.type==='foundation'?state.foundations[source.col]:state.tableau[source.col];
    const snapshot=()=>{history.push(structuredClone(state));if(history.length>150)history.shift()};
    function draw(){if(!state.stock.length&&!state.waste.length)return false;snapshot();if(state.stock.length){const card=state.stock.pop();card.up=true;state.waste.push(card);}else{state.stock=state.waste.reverse().map(card=>({...card,up:false}));state.waste=[];}state.moves++;return true;}
    function move(source,target){
      if(source.type===target.type&&source.col===target.col)return false;
      const from=pile(source),index=source.index??from.length-1,cards=from.slice(index);if(index<0||!cards.length||cards.some(c=>!c.up))return false;
      if(source.type!=='tableau'&&cards.length!==1)return false;
      for(let i=1;i<cards.length;i++)if(cards[i-1].rank!==cards[i].rank+1||red(cards[i-1])===red(cards[i]))return false;
      const to=pile(target),card=cards[0],top=to.at(-1);
      if(target.type==='foundation'){if(cards.length!==1||(!top?card.rank!==1:card.rank!==top.rank+1||card.suit!==top.suit))return false;}
      else if(target.type==='tableau'){if(!top?card.rank!==13:!top.up||top.rank!==card.rank+1||red(top)===red(card))return false;}
      else return false;
      snapshot();from.splice(index);to.push(...cards);if(source.type==='tableau'&&from.length)from.at(-1).up=true;state.moves++;return true;
    }
    return {get state(){return state},draw,move,undo(){if(history.length){state=history.pop();return true;}return false},won(){return state.foundations.every(p=>p.length===13)},auto(source){for(let col=0;col<4;col++)if(move(source,{type:'foundation',col}))return true;return false;}};
  }
  return {mines,solitaire,red};
})();
