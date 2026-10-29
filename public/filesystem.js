const desktopFiles = (() => {
  const storageKey = 'desktop95-files';
  let nodes;
  try { nodes = JSON.parse(localStorage.getItem(storageKey)); } catch {}
  if (!Array.isArray(nodes)) {
    nodes = [
      { id: 'drive', parent: null, name: '(C:)', type: 'folder' },
      { id: 'documents', parent: 'drive', name: 'My Documents', type: 'folder' },
      { id: 'readme', parent: 'documents', name: 'Readme.txt', type: 'file', content: 'Welcome to your computer.\n\nFiles are saved in this browser. Use Explorer to create folders, open text files, and move unwanted files to the Recycle Bin. Export important files to keep a separate copy.\n' },
      { id: 'notes', parent: 'documents', name: 'Notes.txt', type: 'file', content: localStorage.getItem('desktop95-notes') || '' }
    ];
  }
  const get = id => nodes.find(n => n.id === id);
  function hidden(node) {
    if (!node) return true;
    if (node.deleted) return true;
    return node.parent ? hidden(get(node.parent)) : false;
  }
  function save() {
    localStorage.setItem(storageKey, JSON.stringify(nodes));
    window.dispatchEvent(new Event('fileschange'));
  }
  function validate(parent, name, except) {
    if (!name.trim() || /[\\/:*?"<>|]/.test(name) || name === '.' || name === '..') throw Error('Enter a valid file or folder name.');
    if (!get(parent) || hidden(get(parent))) throw Error('The destination folder is unavailable.');
    if (nodes.some(n => n.parent === parent && !n.deleted && n.id !== except && n.name.toLowerCase() === name.trim().toLowerCase())) throw Error('A file or folder with that name already exists.');
  }
  function create(parent, name, type = 'file', content = '') {
    validate(parent, name);
    const node = { id: crypto.randomUUID(), parent, name: name.trim(), type, ...(type === 'file' ? { content } : {}) };
    nodes.push(node); save(); return node;
  }
  function descendant(id, parent) {
    for (let node = get(id); node; node = get(node.parent)) if (node.id === parent) return true;
    return false;
  }
  return {
    get, hidden, create,
    list(parent) { return nodes.filter(n => n.parent === parent && !hidden(n)).sort((a,b) => (a.type !== b.type ? (a.type === 'folder' ? -1 : 1) : a.name.localeCompare(b.name))); },
    trash() { return nodes.filter(n => n.deleted); },
    path(id) { const names = []; for (let n = get(id); n; n = get(n.parent)) names.unshift(n.id === 'drive' ? 'C:' : n.name); return names.length === 1 ? 'C:\\' : names.join('\\'); },
    rename(id, name) { const n = get(id); if (!n || id === 'drive') throw Error('This item cannot be renamed.'); validate(n.parent, name, id); n.name = name.trim(); save(); },
    write(id, content) { const n = get(id); if (!n || hidden(n) || n.type !== 'file') throw Error('The file is unavailable.'); n.content = content; save(); },
    remove(id) { const n = get(id); if (!n || ['drive','documents'].includes(id)) throw Error('This system folder cannot be deleted.'); n.deleted = Date.now(); save(); },
    restore(id) { const n = get(id); if (!n?.deleted) return; if (hidden(get(n.parent))) n.parent = 'documents'; const base = n.name; let i = 1; while (nodes.some(other => other.id !== id && !other.deleted && other.parent === n.parent && other.name.toLowerCase() === n.name.toLowerCase())) n.name = base + ' (restored ' + i++ + ')'; delete n.deleted; save(); },
    empty() { const deleted = nodes.filter(n => n.deleted).map(n => n.id); nodes = nodes.filter(n => !deleted.some(id => descendant(n.id, id))); save(); },
    move(id, parent) { const n = get(id); if (!n || ['drive','documents'].includes(id)) throw Error('This system folder cannot be moved.'); if (descendant(parent,id)) throw Error('A folder cannot be moved into itself.'); if (get(parent)?.type !== 'folder') throw Error('Choose a destination folder.'); validate(parent,n.name,id); n.parent = parent; save(); }
  };
})();
