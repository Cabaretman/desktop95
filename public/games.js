appLaunchers.mines=()=>{
  const view=systemWindow('mines','Minesweeper',276,360);if(!view)return;
  view.w.classList.add('mines-window');let game,elapsed=0,flagMode=false;
  const tools=el('div',{className:'row'}),newButton=el('button',{},'New Game'),flagButton=el('button',{},'Flag mode');tools.append(newButton,flagButton);
  const scoreboard=el('div',{className:'mine-score'}),remaining=el('span'),face=el('button',{title:'New game'},'☺'),time=el('span');scoreboard.append(remaining,face,time);
  const grid=el('div',{className:'mine-grid',role:'group',ariaLabel:'Minefield'});view.content.append(tools,scoreboard,grid);
  const render=()=>{grid.replaceChildren();remaining.textContent=String(game.remaining()).padStart(3,'0');time.textContent=String(elapsed).padStart(3,'0');face.textContent=game.state.won?'☻':game.state.over?'☹':'☺';
    game.state.cells.forEach((cell,index)=>{const button=el('button',{className:'mine-cell',ariaLabel:`Row ${Math.floor(index/9)+1} column ${index%9+1}`});
      button.setAttribute('aria-label',`Row ${Math.floor(index/9)+1} column ${index%9+1}: ${cell.flag?'flagged':cell.open?(cell.mine?'mine':cell.count+' adjacent mines'):'covered'}`);button.classList.toggle('revealed',cell.open);button.classList.toggle('exploded',game.state.over&&!game.state.won&&cell.open&&cell.mine);
      if(cell.flag)button.textContent='⚑';else if(cell.mine&&game.state.over)button.textContent='✹';else if(cell.open&&cell.count){button.textContent=cell.count;button.dataset.count=cell.count;}
      button.onclick=()=>{if(flagMode)game.flag(index);else game.reveal(index);render();};button.oncontextmenu=event=>{event.preventDefault();game.flag(index);render()};grid.append(button);
    });view.status.textContent=game.state.won?'You win!':game.state.over?'Game over. Start a new game.':'10 mines · Right-click to flag';
  };
  const reset=()=>{game=desktopGames.mines();elapsed=0;render()};newButton.onclick=face.onclick=reset;
  flagButton.onclick=()=>{flagMode=!flagMode;flagButton.classList.toggle('pressed',flagMode);flagButton.setAttribute('aria-pressed',String(flagMode))};
  const timer=setInterval(()=>{if(game.state.started&&!game.state.over){elapsed=Math.min(999,elapsed+1);time.textContent=String(elapsed).padStart(3,'0')}},1000);view.signal.addEventListener('abort',()=>clearInterval(timer));reset();
};

appLaunchers.solitaire=()=>{
  const view=systemWindow('solitaire','Solitaire',575,450);if(!view)return;
  view.w.classList.add('solitaire-window');let game=desktopGames.solitaire(),selected=null;
  const tools=el('div',{className:'row'}),newButton=el('button',{},'New Game'),undo=el('button',{},'Undo'),instructions=el('button',{},'How to Play');tools.append(newButton,undo,instructions);
  const table=el('div',{className:'card-table'});view.content.append(tools,table);
  const ranks=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  function select(source){if(selected&&game.move(selected,source)){selected=null;render();return}selected=source;render();}
  function cardButton(card,source){const button=el('button',{className:'playing-card'});button.classList.toggle('card-back',!card.up);button.classList.toggle('red-card',desktopGames.red(card));
    button.setAttribute('aria-label',card.up?ranks[card.rank]+' '+card.suit:'Face-down card');
    if(card.up){button.append(el('span',{className:'card-corner'},ranks[card.rank]+'\n'+card.suit),el('span',{className:'card-suit'},card.suit));button.onclick=()=>select(source);button.ondblclick=()=>{if(game.auto(source)){selected=null;render();}};}
    button.classList.toggle('card-selected',!!selected&&selected.type===source.type&&selected.col===source.col&&(source.type!=='tableau'||source.index>=selected.index));return button;
  }
  function empty(label,target){const button=el('button',{className:'empty-pile',title:label},target.type==='foundation'?'A':'');button.setAttribute('aria-label',label);button.onclick=()=>{if(selected&&game.move(selected,target)){selected=null;render()}};return button;}
  function render(){table.replaceChildren();undo.disabled=game.state.moves===0;const state=game.state,top=el('div',{className:'card-top'}),stock=el('button',{className:'stock-pile',title:'Draw a card',ariaLabel:'Draw a card'},state.stock.length?'':'↻');stock.classList.toggle('card-back',!!state.stock.length);stock.onclick=()=>{game.draw();selected=null;render()};top.append(stock);
    const waste=el('div',{className:'pile'});if(state.waste.length)waste.append(cardButton(state.waste.at(-1),{type:'waste',index:state.waste.length-1}));top.append(waste,el('div',{className:'card-spacer'}));
    state.foundations.forEach((pile,col)=>{const wrapper=el('div',{className:'pile'}),target={type:'foundation',col};wrapper.append(empty('Foundation '+(col+1),target));if(pile.length){const button=cardButton(pile.at(-1),{...target,index:pile.length-1});button.onclick=()=>select(target);wrapper.append(button)}top.append(wrapper)});table.append(top);
    const tableau=el('div',{className:'tableau'});state.tableau.forEach((pile,col)=>{const column=el('div',{className:'tableau-column'});column.style.minHeight=Math.max(100,86+22*(pile.length-1))+'px';column.append(empty('Tableau column '+(col+1),{type:'tableau',col}));pile.forEach((card,index)=>{const button=cardButton(card,{type:'tableau',col,index});button.style.top=index*22+'px';column.append(button)});tableau.append(column)});table.append(tableau);
    view.status.textContent=game.won()?'You win! All cards are home.':'Draw one · Moves: '+state.moves+' · Select a card, then a destination';
  }
  undo.onclick=()=>{game.undo();selected=null;render()};newButton.onclick=async()=>{if(game.state.moves&&!(await systemDialog('New Game','Abandon this game and deal again?',{cancel:true})))return;game=desktopGames.solitaire();selected=null;render()};
  instructions.onclick=()=>systemDialog('Solitaire','Build tableau columns downward in alternating colors. Only a King can fill an empty column. Build the four foundations upward from Ace to King by suit. Click a card or run, then its destination. Double-click a top card to send it to a foundation. Draw one card from the stock; recycle the waste when it is empty. Undo reverses a move.');render();
};
