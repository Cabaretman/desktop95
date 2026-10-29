function readConversations(){try{const data=JSON.parse(localStorage.getItem('desktop95-conversations')||'[]');return Array.isArray(data)?data:[]}catch{return[]}}
appLaunchers.chat=()=>{
  const view=systemWindow('chat','AI Chat',620,420);if(!view)return;
  view.w.classList.add('saved-chat-window');let conversations=readConversations(),current=conversations[0]?.id,busy=false;
  const body=el('div',{className:'chat-layout'}),sidebar=el('div',{className:'chat-sidebar'}),newButton=el('button',{},'New Conversation'),list=el('div',{className:'conversation-list'}),panel=el('div',{className:'chat-panel'}),log=el('div',{className:'chat-log',role:'log'}),tools=el('div',{className:'row'}),exportButton=el('button',{},'Export'),deleteButton=el('button',{},'Delete'),signIn=el('a',{href:'/signin-with-chatgpt?return_to=%2F',target:'_top'},'Sign in');
  tools.append(exportButton,deleteButton,signIn);sidebar.append(newButton,list);const form=el('form',{className:'row'}),input=el('input',{ariaLabel:'Message',placeholder:'Type a message...',required:true}),send=el('button',{type:'submit'},'Send');form.append(input,send);panel.append(tools,log,form);body.append(sidebar,panel);view.content.append(body);
  const persist=()=>localStorage.setItem('desktop95-conversations',JSON.stringify(conversations));
  const conversation=()=>conversations.find(c=>c.id===current);
  function newConversation(){const item={id:crypto.randomUUID(),title:'New conversation',messages:[],updated:Date.now()};conversations.unshift(item);current=item.id;persist();render();input.focus();}
  function render(){list.replaceChildren();for(const item of conversations){const button=el('button',{className:item.id===current?'pressed':''},item.title);button.onclick=()=>{if(busy)return;current=item.id;render()};list.append(button)}log.replaceChildren();const item=conversation();
    if(!item?.messages.length)log.append(el('p',{},'Start a conversation. Messages are saved in this browser.'));
    for(const message of item?.messages||[]){const box=el('div',{className:'message'});box.append(el('b',{},message.role==='user'?'You':'Assistant'),el('span',{},message.content));log.append(box)}log.scrollTop=log.scrollHeight;exportButton.disabled=deleteButton.disabled=!item||busy;newButton.disabled=busy;
  }
  function errorMessage(text){const box=el('div',{className:'message'});box.append(el('b',{},'System'),el('span',{},text));log.append(box);log.scrollTop=log.scrollHeight;}
  newButton.onclick=newConversation;exportButton.onclick=()=>{const item=conversation();if(item)download(item.title.replace(/[\\/:*?"<>|]/g,'_')+'.txt',item.messages.map(m=>(m.role==='user'?'You':'Assistant')+':\n'+m.content).join('\n\n'))};
  deleteButton.onclick=async()=>{const item=conversation();if(!item||busy)return;if(await systemDialog('Delete Conversation','Delete this saved conversation?',{cancel:true,ok:'Delete'})){conversations=conversations.filter(c=>c.id!==item.id);current=conversations[0]?.id;persist();if(!current)newConversation();else render();}};
  const requestController=new AbortController();view.signal.addEventListener('abort',()=>requestController.abort());
  form.onsubmit=async event=>{
    event.preventDefault();if(busy)return;const text=input.value.trim();if(!text)return;if(text.length>8000){errorMessage('Please keep each message under 8,000 characters.');return;}if(!conversation())newConversation();
    const item=conversation();item.messages.push({role:'user',content:text});if(item.messages.length===1)item.title=text.slice(0,35);item.updated=Date.now();persist();input.value='';busy=true;send.disabled=true;render();view.status.textContent='Connecting...';
    try{const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:item.messages.slice(-80)}),signal:AbortSignal.any([requestController.signal,AbortSignal.timeout(60000)])});const data=await response.json();if(!response.ok)throw Error(data.error||'The AI connection failed.');item.messages.push({role:'assistant',content:data.content});persist();desktopSound.play('notification');view.status.textContent='Ready';}
    catch(error){if(view.signal.aborted)return;errorMessage(error.message);desktopSound.play('error');view.status.textContent=error.message;}
    finally{busy=false;send.disabled=false;if(!view.signal.aborted){const error=view.status.textContent;render();if(error!=='Ready')errorMessage(error);input.focus();}}
  };
  if(!current)newConversation();else render();
  fetch('/api/chat',{signal:view.signal}).then(async response=>{const data=await response.json();signIn.hidden=response.status!==401;view.status.textContent=response.ok?(data.configured?'Secure connection ready':'AI provider not configured on the server'):data.error||'Sign in to use AI Chat';}).catch(()=>{view.status.textContent='Server connection unavailable'});
};

const settingsOpen=open;
open=function(id){
  const result=settingsOpen(id);
  if(id==='settings'){
    const content=windows.get('settings')?.w.querySelector('.content');
    if(content&&!content.dataset.secure){
      content.dataset.secure='true';let remove=false;
      for(const node of [...content.children]){if(node.tagName==='H3'&&node.textContent==='AI connection')remove=true;if(remove)node.remove();}
      content.append(el('h3',{},'AI connection'),el('p',{},'AI Chat uses a server-side secret. Only your signed-in account can use the connection. Your API key is never stored in the page.'));
    }
  }
  return result;
};
