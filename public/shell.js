const newApps = {
  explorer: ['', 'My Computer'], bin: ['', 'Recycle Bin'], mines: ['', 'Minesweeper'],
  solitaire: ['', 'Solitaire'], dos: ['', 'MS-DOS Prompt']
};
Object.assign(apps, newApps);

function systemWindow(id, title, width = 530, height = 390) {
  if (windows.has(id)) { focus(id); return null; }
  desktopSound.play('open');
  $('#start-menu').hidden = true;
  const controller = new AbortController();
  const w = el('section', { className: 'window', role: 'dialog' });
  w.setAttribute('aria-label', title);
  w.dataset.app = id;
  w.style.width = width + 'px'; w.style.height = height + 'px';
  w.style.left = Math.max(4, Math.min(140 + windows.size * 22, innerWidth - width - 8)) + 'px';
  w.style.top = Math.max(4, Math.min(40 + windows.size * 20, innerHeight - height - 40)) + 'px';
  const bar = el('div', { className: 'titlebar' }), heading = el('strong', {}, title);
  const min = el('button', { title: 'Minimize' }, '_'), max = el('button', { title: 'Maximize' }, '□'), exit = el('button', { title: 'Close' }, '×');
  bar.append(pixelIcon(id.startsWith('editor-')?'notes':id, true), heading, min, max, exit);
  const content = el('div', { className: 'content' }), status = el('div', { className: 'status' }, 'Ready');
  const task = el('button'); task.append(pixelIcon(id.startsWith('editor-')?'notes':id, true), el('span', {}, title));
  w.append(bar, content, status); $('#desktop').append(w); $('#tasks').append(task);
  windows.set(id, { w, task }); focus(id);
  const close = () => { controller.abort(); w.remove(); task.remove(); windows.delete(id); desktopSound.play('close'); };
  const minimize = () => { w.hidden = true; w.classList.remove('active'); task.classList.remove('pressed'); };
  exit.onclick = close; min.onclick = minimize;
  max.onclick = () => w.classList.toggle('maximized');
  bar.ondblclick = () => w.classList.toggle('maximized');
  task.onclick = () => w.hidden || !w.classList.contains('active') ? focus(id) : minimize();
  w.addEventListener('pointerdown', () => focus(id));
  w.addEventListener('keydown', event => { if (event.altKey && event.key === 'F4') { event.preventDefault(); close(); } });
  bar.onpointerdown = event => {
    if (event.target.closest('button') || w.classList.contains('maximized')) return;
    const dx = event.clientX - w.offsetLeft, dy = event.clientY - w.offsetTop;
    bar.setPointerCapture(event.pointerId);
    bar.onpointermove = next => { w.style.left = Math.max(0,Math.min(innerWidth - 80,next.clientX - dx)) + 'px'; w.style.top = Math.max(0,Math.min(innerHeight - 70,next.clientY - dy)) + 'px'; };
    bar.onpointerup = bar.onpointercancel = () => bar.onpointermove = null;
  };
  return { w, content, status, close, signal: controller.signal, title: heading, task };
}

function systemDialog(title, message, options = {}) {
  return new Promise(resolve => {
    const backdrop = el('div', { className: 'dialog-backdrop' });
    const dialog = el('section', { className: 'system-dialog', role: 'dialog' });
    dialog.setAttribute('aria-label', title); dialog.setAttribute('aria-modal','true');
    const bar = el('div', { className: 'titlebar' }); bar.append(el('strong', {}, title));
    const body = el('div', { className: 'dialog-body' }); body.append(el('p', {}, message));
    let input;
    if ('value' in options) { input = el('input', { value: options.value, ariaLabel: title }); body.append(input); }
    const actions = el('div', { className: 'dialog-actions' });
    const finish = value => { backdrop.remove(); resolve(value); };
    const ok = el('button', {}, options.ok || 'OK'); ok.onclick = () => finish(input ? input.value : true); actions.append(ok);
    if (options.cancel || input) { const cancel = el('button', {}, 'Cancel'); cancel.onclick = () => finish(null); actions.append(cancel); }
    dialog.append(bar,body,actions); backdrop.append(dialog); document.body.append(backdrop);
    dialog.onkeydown = event => { if (event.key === 'Escape') finish(null); else if (event.key === 'Enter') ok.click(); };
    (input || ok).focus(); input?.select();
  });
}
function showError(error) { desktopSound.play('error'); return systemDialog('Desktop', error.message || String(error)); }

const appLaunchers = {};
const originalOpen = open;
open = function(id) {
  if (appLaunchers[id]) return appLaunchers[id]();
  return originalOpen(id);
};

for (const [id, [, name]] of Object.entries(newApps)) {
  const icon = el('button', { className:'icon', title:'Double-click to open ' + name });
  icon.dataset.app = id; icon.append(pixelIcon(id),el('span',{},name));
  icon.ondblclick = () => open(id);
  icon.onkeydown = event => { if (event.key === 'Enter') { event.preventDefault(); open(id); } };
  $('#icons').append(icon);
  const item = el('button'); item.append(pixelIcon(id),el('span',{},name)); item.onclick = () => open(id); $('#programs').append(item);
}
document.querySelectorAll('#icons .icon').forEach((icon,i) => {
  icon.dataset.app ||= Object.keys(apps)[i];
  icon.setAttribute('aria-pressed', 'false');
});

function powerDialog() {
  const backdrop = el('div', { className:'dialog-backdrop' });
  const dialog = el('section', { className:'system-dialog', role:'dialog' });
  dialog.setAttribute('aria-label','Shut Down Windows');
  const title = el('div', { className:'titlebar' }); title.append(el('strong',{},'Shut Down Windows'));
  const body = el('div', { className:'dialog-body' }); body.append(el('p',{},'What do you want the computer to do?'));
  let choice = 'shutdown';
  for (const [value,text] of [['shutdown','Shut down the computer?'],['restart','Restart the computer?']]) {
    const label = el('label', { className:'radio-row' }), radio = el('input',{type:'radio',name:'power-choice',value,checked:value===choice});
    radio.onchange = () => choice = value; label.append(radio,el('span',{},text)); body.append(label);
  }
  const actions = el('div',{className:'dialog-actions'}), yes=el('button',{},'Yes'), no=el('button',{},'No');
  no.onclick=()=>backdrop.remove(); yes.onclick=()=>{
    if(choice==='restart'){sessionStorage.setItem('desktop95-reboot','true');location.reload();return;}
    desktopSound.silence();
    backdrop.remove(); const off=el('div',{className:'power-off'});
    off.append(el('p',{},"It's now safe to turn off your computer."));
    const button=el('button',{},'Turn on computer'); button.onclick=()=>{sessionStorage.setItem('desktop95-reboot','true');location.reload()};off.append(button);document.body.append(off);
  };
  actions.append(yes,no);dialog.append(title,body,actions);backdrop.append(dialog);document.body.append(backdrop);yes.focus();
}
const shutdown = el('button',{className:'shutdown-item'},'Shut Down...'); shutdown.onclick=()=>{ $('#start-menu').hidden=true;powerDialog(); };$('#programs').append(shutdown);

function desktopMenu(x,y,items) {
  document.querySelector('.desktop-context')?.remove();
  const menu=el('div',{className:'desktop-context',role:'menu'});
  for(const [label,action] of items){const button=el('button',{role:'menuitem'},label);button.onclick=()=>{menu.remove();action()};menu.append(button)}
  document.body.append(menu);
  menu.style.left=Math.min(x,innerWidth-menu.offsetWidth-4)+'px';menu.style.top=Math.min(y,innerHeight-menu.offsetHeight-4)+'px';
}
document.addEventListener('pointerdown',event=>{if(!event.target.closest('.desktop-context'))document.querySelector('.desktop-context')?.remove()});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelector('.desktop-context')?.remove()});

function arrangeIcons(reset=false) {
  const icons=[...$('#icons').children];
  let saved={}; try{saved=JSON.parse(localStorage.getItem('desktop95-icon-positions')||'{}')}catch{}
  const rows=Math.max(1,Math.floor(($('#desktop').clientHeight-16)/80));
  icons.forEach((icon,i)=>{
    const fallback={x:8+Math.floor(i/rows)*86,y:12+(i%rows)*80};
    const p=!reset&&saved[icon.dataset.app]||fallback;
    icon.style.left=Math.min(Math.max(0,p.x),Math.max(0,innerWidth-82))+'px';
    icon.style.top=Math.min(Math.max(0,p.y),Math.max(0,$('#desktop').clientHeight-72))+'px';
  });
  if(reset)localStorage.removeItem('desktop95-icon-positions');
}
arrangeIcons();addEventListener('resize',()=>{arrangeIcons();windows.forEach(({w})=>{if(w.classList.contains('maximized'))return;w.style.left=Math.max(0,Math.min(w.offsetLeft,innerWidth-w.offsetWidth-4))+'px';w.style.top=Math.max(0,Math.min(w.offsetTop,innerHeight-28-w.offsetHeight-4))+'px';});});
$('#desktop').addEventListener('contextmenu',event=>{
  if(event.target.closest('.window'))return;
  event.preventDefault();const icon=event.target.closest('.icon');
  if(icon){selectDesktopIcon(icon);desktopMenu(event.clientX,event.clientY,[['Open',()=>open(icon.dataset.app)],['Arrange Icons',()=>arrangeIcons(true)]]);}
  else desktopMenu(event.clientX,event.clientY,[['Arrange Icons',()=>arrangeIcons(true)],['Refresh',()=>arrangeIcons()],['Properties',()=>open('settings')]]);
});
$('#icons').addEventListener('pointerdown',event=>{
  if(event.button!==0)return;const icon=event.target.closest('.icon');if(!icon)return;
  const startX=event.clientX,startY=event.clientY,left=icon.offsetLeft,top=icon.offsetTop;let dragged=false;
  icon.setPointerCapture(event.pointerId);
  icon.onpointermove=move=>{
    if(!dragged&&Math.hypot(move.clientX-startX,move.clientY-startY)<5)return;
    dragged=true;selectDesktopIcon(icon);icon.classList.add('dragging');
    icon.style.left=Math.max(0,Math.min(innerWidth-82,left+move.clientX-startX))+'px';
    icon.style.top=Math.max(0,Math.min($('#desktop').clientHeight-72,top+move.clientY-startY))+'px';
  };
  icon.onpointerup=icon.onpointercancel=()=>{
    icon.onpointermove=null;icon.classList.remove('dragging');
    if(dragged){let saved={};try{saved=JSON.parse(localStorage.getItem('desktop95-icon-positions')||'{}')}catch{}saved[icon.dataset.app]={x:icon.offsetLeft,y:icon.offsetTop};localStorage.setItem('desktop95-icon-positions',JSON.stringify(saved));}
  };
});
$('#desktop').addEventListener('pointerdown',event=>{
  if(event.button!==0||event.target.closest('.icon,.window'))return;
  const bounds=$('#desktop').getBoundingClientRect(),x=event.clientX-bounds.left,y=event.clientY-bounds.top;
  const box=el('div',{className:'selection-box'});$('#desktop').append(box);
  const move=next=>{
    const nx=next.clientX-bounds.left,ny=next.clientY-bounds.top,left=Math.min(x,nx),top=Math.min(y,ny),right=Math.max(x,nx),bottom=Math.max(y,ny);
    Object.assign(box.style,{left:left+'px',top:top+'px',width:right-left+'px',height:bottom-top+'px'});
    document.querySelectorAll('#icons .icon').forEach(icon=>{const overlap=icon.offsetLeft<right&&icon.offsetLeft+icon.offsetWidth>left&&icon.offsetTop<bottom&&icon.offsetTop+icon.offsetHeight>top;icon.classList.toggle('selected',overlap);icon.setAttribute('aria-pressed',String(overlap))});
  };
  const end=()=>{box.remove();removeEventListener('pointermove',move);removeEventListener('pointerup',end)};
  addEventListener('pointermove',move);addEventListener('pointerup',end,{once:true});
});
