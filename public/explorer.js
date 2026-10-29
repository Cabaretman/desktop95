function openEditor(fileId = 'notes') {
  const file=desktopFiles.get(fileId);
  if(!file||desktopFiles.hidden(file)||file.type!=='file')return showError('The file is unavailable.');
  const view=systemWindow('editor-'+fileId,file.name+' - Notepad',510,370);if(!view)return;
  view.w.dataset.app='notes';
  const toolbar=el('div',{className:'row'}),exportButton=el('button',{},'Save As...'),location=el('span',{className:'file-location'},desktopFiles.path(fileId));
  exportButton.onclick=()=>download(file.name,text.value);toolbar.append(exportButton,location);
  const text=el('textarea',{value:file.content||'',ariaLabel:file.name,spellcheck:false});
  text.oninput=()=>{try{desktopFiles.write(fileId,text.value);view.status.textContent='Saved · '+text.value.length+' characters'}catch(error){view.status.textContent=error.message}};
  view.content.append(toolbar,text);view.status.textContent='Saved in this browser';text.focus();
  window.addEventListener('fileschange',()=>{
    const current=desktopFiles.get(fileId);if(!current||desktopFiles.hidden(current)){text.readOnly=true;view.status.textContent='This file is in the Recycle Bin.'}else{text.readOnly=false;view.title.textContent=current.name+' - Notepad';}
  },{signal:view.signal});
}
appLaunchers.notes=()=>{
  const notes=desktopFiles.get('notes');
  if(notes&&!desktopFiles.hidden(notes))return openEditor();
  let index=1,name='Untitled.txt';
  while(desktopFiles.list('documents').some(n=>n.name.toLowerCase()===name.toLowerCase()))name='Untitled '+(index++)+'.txt';
  openEditor(desktopFiles.create('documents',name).id);
};

function openExplorer(start='drive',recycle=false) {
  const id=recycle?'bin':'explorer';
  if(windows.has(id)){focus(id);if(!recycle&&windows.get(id).navigate)windows.get(id).navigate(start);return;}
  const view=systemWindow(id,recycle?'Recycle Bin':'My Computer',570,390);if(!view)return;
  view.w.classList.add('explorer-window');let folder=start,selected=null;
  const toolbar=el('div',{className:'explorer-toolbar'}),address=el('div',{className:'address-row'}),path=el('input',{readOnly:true,ariaLabel:'Address'}),list=el('div',{className:'file-list',role:'listbox'});
  address.append(el('span',{},'Address'),path);
  const buttons={};
  const add=(name,action)=>{const button=el('button',{},name);button.onclick=async()=>{try{await action()}catch(error){showError(error)}};toolbar.append(button);buttons[name]=button;return button};
  async function make(type){const name=await systemDialog(type==='folder'?'New Folder':'New Text File','Enter a name:',{value:type==='folder'?'New Folder':'New Text File.txt'});if(name===null)return;const node=desktopFiles.create(folder,name,type);selected=node.id;render();}
  async function rename(){if(!selected)return;const node=desktopFiles.get(selected),name=await systemDialog('Rename','Enter a new name:',{value:node.name});if(name!==null)desktopFiles.rename(selected,name);}
  const remove=()=>{if(selected)desktopFiles.remove(selected);selected=null;render()};
  const restore=()=>{if(selected)desktopFiles.restore(selected);selected=null;render()};
  if(recycle){add('Restore',restore);add('Empty Recycle Bin',async()=>{if(!desktopFiles.trash().length)return;if(await systemDialog('Empty Recycle Bin','Permanently delete all items in the Recycle Bin? This cannot be undone.',{cancel:true,ok:'Delete'}))desktopFiles.empty();});}
  else{
    add('Up',()=>navigate(desktopFiles.get(folder)?.parent||'drive'));
    add('New Folder',()=>make('folder'));add('New Text File',()=>make('file'));add('Rename',rename);add('Delete',remove);
    add('Move...',async()=>{if(!selected)return;const destination=await systemDialog('Move Item','Enter the destination folder path:',{value:'C:\\My Documents'});if(destination===null)return;let parent='drive';for(const part of destination.replace(/^c:[\\/]?/i,'').split(/[\\/]/).filter(Boolean)){const node=desktopFiles.list(parent).find(n=>n.type==='folder'&&n.name.toLowerCase()===part.toLowerCase());if(!node)throw Error('Folder not found.');parent=node.id;}desktopFiles.move(selected,parent);});
  }
  function select(id){selected=id;list.querySelectorAll('.file-item').forEach(button=>{const active=button.dataset.id===id;button.classList.toggle('selected',active);button.setAttribute('aria-selected',String(active))});updateButtons()}
  function updateButtons(){for(const name of recycle?['Restore']:['Rename','Delete','Move...'])buttons[name].disabled=!selected;if(!recycle)buttons.Up.disabled=folder==='drive';}
  function navigate(id){folder=id;selected=null;render()}
  function render(){
    if(!recycle&&desktopFiles.hidden(desktopFiles.get(folder)))folder='documents';
    const items=recycle?desktopFiles.trash():desktopFiles.list(folder);list.replaceChildren();
    if(!items.some(n=>n.id===selected))selected=null;
    path.value=recycle?'Recycle Bin':desktopFiles.path(folder);
    for(const node of items){
      const button=el('button',{className:'file-item',role:'option'});button.dataset.id=node.id;button.setAttribute('aria-selected',String(node.id===selected));button.classList.toggle('selected',node.id===selected);
      button.append(pixelIcon(node.type==='folder'?'folder':'notes'),el('span',{},node.name));
      button.onclick=()=>select(node.id);
      button.ondblclick=()=>{if(recycle)return;node.type==='folder'?navigate(node.id):openEditor(node.id)};
      button.oncontextmenu=event=>{event.preventDefault();select(node.id);desktopMenu(event.clientX,event.clientY,recycle?[['Restore',restore]]:[['Open',()=>node.type==='folder'?navigate(node.id):openEditor(node.id)],['Rename',()=>rename().catch(showError)],['Delete',()=>{try{remove()}catch(error){showError(error)}}]])};
      button.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();button.ondblclick()}else if(event.key==='Delete'&&!recycle){try{remove()}catch(error){showError(error)}}};
      list.append(button);
    }
    if(!items.length)list.append(el('div',{className:'empty-folder'},recycle?'The Recycle Bin is empty.':'This folder is empty.'));
    view.status.textContent=items.length+' object(s) · Stored in this browser';updateButtons();
  }
  windows.get(id).navigate=navigate;
  view.content.append(toolbar,address,list);window.addEventListener('fileschange',render,{signal:view.signal});render();
}
appLaunchers.explorer=()=>openExplorer();appLaunchers.bin=()=>openExplorer('drive',true);

appLaunchers.dos=()=>{
  const view=systemWindow('dos','MS-DOS Prompt',560,350);if(!view)return;
  view.w.classList.add('dos-window');let folder='drive',history=[],historyIndex=0;
  const output=el('div',{className:'dos-output',role:'log'}),form=el('form',{className:'dos-command'}),label=el('label'),input=el('input',{autocomplete:'off',spellcheck:false,ariaLabel:'DOS command'});
  input.id='dos-command';label.htmlFor=input.id;form.append(label,input);view.content.append(output,form);
  const print=text=>{output.append(el('div',{},text));view.content.scrollTop=view.content.scrollHeight};
  const prompt=()=>label.textContent=desktopFiles.path(folder)+'>';
  const resolve=path=>{
    let current=/^c:/i.test(path)||path.startsWith('\\')?'drive':folder;
    for(const part of path.replace(/^c:/i,'').split(/[\\/]/).filter(Boolean)){if(part==='.')continue;if(part==='..'){current=desktopFiles.get(current)?.parent||'drive';continue}const node=desktopFiles.list(current).find(n=>n.name.toLowerCase()===part.toLowerCase());if(!node)throw Error('File or directory not found.');current=node.id;}
    return current;
  };
  print('Microsoft(R) Windows 95\n(C)Copyright Microsoft Corp 1981-1995.\n\nType HELP for available commands.');prompt();
  form.onsubmit=event=>{event.preventDefault();const line=input.value.trim();input.value='';if(!line)return;history.push(line);historyIndex=history.length;print(label.textContent+line);
    const parts=line.match(/"[^"]*"|\S+/g).map(p=>p.replace(/^"|"$/g,'')),command=parts.shift().toLowerCase(),arg=parts.join(' ');
    try{
      if(command==='help')print('DIR          List files and folders\nCD path      Change directory (CD .. goes up)\nTYPE file    Display a text file\nMD name      Make a directory\nDEL file     Move a file to the Recycle Bin\nSTART app    Open explorer, notepad, paint, calc, chat,\n             minesweeper, solitaire, settings, or a file\nCLS          Clear the screen\nVER          Show version\nEXIT         Close this window\nSHUTDOWN     Shut down or restart');
      else if(command==='dir'){print(' Directory of '+desktopFiles.path(folder)+'\n');desktopFiles.list(folder).forEach(n=>print((n.type==='folder'?'<DIR>       ':String((n.content||'').length).padStart(8)+'    ')+n.name));}
      else if(command==='cd'||command==='chdir'){if(!arg)print(desktopFiles.path(folder));else{const id=resolve(arg);if(desktopFiles.get(id).type!=='folder')throw Error('Not a directory.');folder=id;}}
      else if(command==='type'){const node=desktopFiles.get(resolve(arg));if(node.type!=='file')throw Error('Not a text file.');print(node.content||'');}
      else if(command==='md'||command==='mkdir'){desktopFiles.create(folder,arg,'folder');}
      else if(command==='del'){const id=resolve(arg);if(desktopFiles.get(id).type!=='file')throw Error('DEL only accepts files.');desktopFiles.remove(id);print('Moved to Recycle Bin.');}
      else if(command==='cls')output.replaceChildren();
      else if(command==='ver')print('Windows 95 browser desktop [Version 4.00]');
      else if(command==='exit'){view.close();return;}
      else if(command==='shutdown')powerDialog();
      else if(command==='start'){const aliases={notepad:'notes',calc:'calc',paint:'paint',chat:'chat',explorer:'explorer',minesweeper:'mines',solitaire:'solitaire',settings:'settings'};if(aliases[arg.toLowerCase()])open(aliases[arg.toLowerCase()]);else{const node=desktopFiles.get(resolve(arg));node.type==='folder'?openExplorer(node.id):openEditor(node.id);}}
      else print('Bad command or file name');
    }catch(error){print(error.message)}prompt();
  };
  input.onkeydown=event=>{if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();historyIndex=Math.max(0,Math.min(history.length,historyIndex+(event.key==='ArrowUp'?-1:1)));input.value=history[historyIndex]||'';}};
  view.status.hidden=true;input.focus();
};
