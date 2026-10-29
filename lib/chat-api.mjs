const json = (value, status=200) => Response.json(value,{status,headers:{'Cache-Control':'no-store'}});

export async function handleChat(request, config, fetcher=fetch) {
  const email=request.headers.get('oai-authenticated-user-email');
  const user=request.headers.get('oai-authenticated-user-id');
  if(!email||!user)return json({error:'Sign in to use AI Chat.'},401);
  if(email.toLowerCase()!==(config.OWNER_EMAIL||'rafay11hadi@gmail.com').toLowerCase())return json({error:'This AI connection is only available to the owner.'},403);
  const configured=!!(config.AI_API_KEY&&config.AI_MODEL);
  if(request.method==='GET')return json({configured});
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Invalid request origin.'},403);
  if(!configured)return json({error:'Configure AI_API_KEY and AI_MODEL as deployment secrets to enable chat.'},503);
  if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Expected a JSON request.'},415);
  if(Number(request.headers.get('content-length')||0)>150000)return json({error:'Conversation is too large.'},413);
  let body;
  try{const text=await request.text();if(text.length>150000)return json({error:'Conversation is too large.'},413);body=JSON.parse(text);}catch{return json({error:'Invalid JSON.'},400);}
  if(!Array.isArray(body.messages)||!body.messages.length||body.messages.length>80)return json({error:'Invalid conversation.'},400);
  let length=0;
  for(const message of body.messages){if(!['user','assistant'].includes(message.role)||typeof message.content!=='string'||message.content.length>8000)return json({error:'Invalid message.'},400);length+=message.content.length;}
  if(length>50000)return json({error:'This conversation is too long. Start a new conversation.'},400);
  const messages=body.messages.map(({role,content})=>({role,content}));
  try{
    const endpoint=new URL(config.AI_ENDPOINT||'https://api.openai.com/v1/chat/completions');
    if(endpoint.protocol!=='https:')return json({error:'The server endpoint must use HTTPS.'},503);
    const response=await fetcher(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+config.AI_API_KEY},body:JSON.stringify({model:config.AI_MODEL,messages,max_completion_tokens:2048,store:false}),signal:AbortSignal.timeout(55000)});
    if(!response.ok)return json({error:'AI provider returned HTTP '+response.status+'. Check the server configuration.'},502);
    const data=await response.json(),content=data.choices?.[0]?.message?.content;
    if(typeof content!=='string')return json({error:'The provider returned an unexpected response.'},502);
    return json({content});
  }catch{return json({error:'The AI provider could not be reached. Please try again.'},502);}
}
