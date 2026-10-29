(() => {
  const screen = document.createElement('div');
  screen.id = 'boot-screen';
  screen.innerHTML = '<div class="power-prompt"><div class="power-symbol">◯</div><h1>Your computer is off.</h1><button id="power-on">Turn on computer</button></div>';
  document.body.append(screen);
  const power = screen.querySelector('button');
  power.addEventListener('click', () => {
    desktopSound.boot();
    screen.innerHTML = '<div class="bios">Award Modular BIOS v4.51PG<br>Personal Computer<br><br>Memory Test : 32768K OK<br><br>Detecting Primary Master ... IDE HARD DISK<br>Detecting Primary Slave  ... CD-ROM DRIVE<br><br>Starting Windows 95...</div>';
    setTimeout(() => { screen.innerHTML = '<div class="boot-logo"><div class="boot-flag">▦</div><div>Microsoft<span>Windows <b>95</b></span></div><p>Starting your computer...</p><div class="boot-progress"></div></div>'; }, 1300);
    setTimeout(() => screen.remove(), 3300);
  });
})();
