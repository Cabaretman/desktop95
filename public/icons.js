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
  const folder=rect(2,9,12,4,'#000')+rect(3,10,10,3,'#ffff80')+rect(2,12,28,17,'#000')+rect(3,13,26,14,'#808000')+rect(4,14,24,12,'#ffff80')+rect(4,14,24,1,'#fff')+rect(5,16,22,9,'#ffff00');
  const bin=rect(9,7,16,22,'#000')+rect(10,8,14,19,'#c0c0c0')+rect(11,9,2,17,'#fff')+rect(15,10,2,15,'#808080')+rect(20,10,2,15,'#808080')+frame(6,4,22,5)+frame(13,1,8,3)+rect(12,15,9,7,'#008000')+rect(15,13,3,11,'#00a000');
  const mines=rect(12,4,8,24,'#000')+rect(4,12,24,8,'#000')+rect(8,8,16,16,'#000')+rect(11,10,4,4,'#fff')+rect(3,3,3,3,'#808080')+rect(26,26,3,3,'#808080');
  const solitaire=frame(3,3,20,26)+rect(5,5,15,21,'#fff')+rect(9,8,8,7,'#f00')+rect(11,15,4,5,'#f00')+frame(13,8,17,23)+rect(15,10,12,18,'#fff')+rect(18,14,6,8,'#000');
  const dos=frame(1,4,30,24)+rect(3,6,25,18,'#000')+rect(6,10,3,1,'#c0c0c0')+rect(8,11,2,1,'#c0c0c0')+rect(6,12,3,1,'#c0c0c0')+rect(12,13,6,1,'#c0c0c0');
  const source={chat,notes,calc,paint,settings,welcome:computer,explorer:computer,folder,bin,mines,solitaire,dos,flag};
  return Object.fromEntries(Object.entries(source).map(([k,v])=>[k,'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">${v}</svg>`)]));
})();
function pixelIcon(id,small=false){const img=document.createElement('img');img.src=pixelIcons[id]||pixelIcons.welcome;img.alt='';img.className=small?'pixel-icon small':'pixel-icon';img.draggable=false;return img}
