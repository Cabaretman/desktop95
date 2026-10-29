// Original synthesized cues; no external audio downloads are needed.
const desktopSound = (() => {
  let context;
  let muted = localStorage.getItem('desktop95-muted') === 'true';
  const cues = {
    startup: [[523,0,.22],[659,.12,.26],[784,.24,.32],[1047,.4,.6]],
    menu: [[740,0,.035]],
    open: [[440,0,.06],[660,.05,.09]],
    close: [[550,0,.045],[370,.04,.07]],
    notification: [[784,0,.12],[1047,.13,.2]],
    error: [[220,0,.15],[165,.16,.23]]
  };
  function play(name) {
    if (muted) return;
    try {
      context ||= new (window.AudioContext || window.webkitAudioContext)();
      context.resume().catch(() => {});
      const start = context.currentTime;
      for (const [frequency, delay, duration] of cues[name] || []) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = name === 'menu' ? 'triangle' : 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start + delay);
        gain.gain.linearRampToValueAtTime(.09, start + delay + .01);
        gain.gain.exponentialRampToValueAtTime(.001, start + delay + duration);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start + delay);
        oscillator.stop(start + delay + duration + .01);
      }
    } catch { /* Audio support must not prevent desktop interactions. */ }
  }
  document.addEventListener('pointerdown', () => play('startup'), { once: true });
  document.addEventListener('keydown', () => {
    if (!context) play('startup');
  }, { once: true });
  return { play, get muted() { return muted; }, setMuted(value) {
    muted = value;
    localStorage.setItem('desktop95-muted', String(value));
  }};
})();
