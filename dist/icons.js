const pixelIcons = (() => {
  const rect = (x,y,w,h,c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  const frame = (x,y,w,h) => rect(x,y,w,h,'#000')+rect(x,y,w-1,h-1,'#fff')+rect(x+1,y+1,w-3,h-3,'#c0c0c0')+rect(x+w-2,y+1,1,h-2,'#808080')+rect(x+1,y+h-2,w-2,1,'#808080');
  const paper = frame(7,3,20,25)+rect(9,5,15,20,'#fff');
  const lines = Array.from({length:7},(_,i)=>rect(11,8+i*2,11,1,i%2?'#808080':'#000080')).join('');
  const chat = frame(2,2,27,21)+rect(5,5,20,13,'#000080')+rect(7,7,3,2,'#0ff')+rect(11,7,10,1,'#fff')+rect(7,11,14,1,'#fff')+rect(7,14,9,1,'#0ff')+rect(12,23,8,3,'#808080')+frame(7,26,18,4);
  const notes = rect(3,6,3,23,'#000')+rect(4,5,22,24,'#000080')+paper+lines+Array.from({length:6},(_,i)=>rect(5,5+i*4,5,2,'#808080')+rect(5,5+i*4,4,1,'#fff')).join('');
  const calc = frame(5,2,23,29)+rect(8,5,16,7,'#000')+rect(9,6,14,5,'#9cae8a')+rect(20,7,2,3,'#000')+Array.from({length:4},(_,y)=>Array.from({length:3},(_,x)=>frame(8+x*5,15+y*3,4,3)).join('')).join('');
  const paint = paper+rect(10,7,5,5,'#f00')+rect(17,8,6,4,'#00f')+rect(11,15,9,6,'#ff0')+Array.from({length:19},(_,i)=>rect(27-i,4+i,3,3,i<4?'#000':i>15?'#f0c080':'#808000')).join('')+rect(7,25,3,3,'#000');
  const settings = frame(2,5,28,24)+rect(4,8,24,18,'#fff')+rect(6,10,7,6,'#000080')+rect(7,11,5,3,'#00ffff')+rect(6,19,7,5,'#808080')+rect(17,10,9,2,'#808080')+rect(17,15,9,2,'#808080')+rect(17,20,9,2,'#808080')+frame(19,8,4,6)+frame(23,13,4,6)+frame(17,18,4,6);
  const computer = frame(5,1,23,22)+rect(8,4,16,14,'#000')+rect(9,5,14,12,'#008080')+rect(10,6,10,1,'#fff')+rect(13,23,7,3,'#808080')+frame(3,26,28,5)+rect(23,28,4,1,'#000');
  const flag = Array.from({length:4},(_,i)=>rect(3+i*7,3+(i%2)*3,6,10,['#f00','#0a0','#00f','#ff0'][i])).join('')+rect(2,14,2,15,'#000');
  const source={chat,notes,calc,paint,settings,welcome:computer,flag};
  return Object.fromEntries(Object.entries(source).map(([k,v])=>[k,'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">${v}</svg>`)]));
})();
function pixelIcon(id,small=false){const img=document.createElement('img');img.src=pixelIcons[id]||pixelIcons.welcome;img.alt='';img.className=small?'pixel-icon small':'pixel-icon';img.draggable=false;return img}
