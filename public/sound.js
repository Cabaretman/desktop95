// Original synthesized cues; no external audio downloads are needed.
const desktopSound = (() => {
  let context;
  let fan;
  let booting = false;
  let ambience = localStorage.getItem('desktop95-ambience') !== 'false';
  const startup = new Audio('audio/startup.wav');
  startup.volume = .65;
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
  function startFan() {
    if (fan || muted || !ambience || !booting) return;
    context ||= new (window.AudioContext || window.webkitAudioContext)();
    context.resume().catch(() => {});
    const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + (Math.random() * 2 - 1) * .035) / 1.025;
      data[i] = last * 4;
    }
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(.17, context.currentTime + 1.8);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start();
    fan = source;
  }
  function stopFan() { if (fan) { fan.stop(); fan.disconnect(); fan = null; } }
  function disk() {
    if (muted || !ambience) return;
    const start = context.currentTime;
    for (let i = 0; i < 26; i++) {
      const oscillator = context.createOscillator(), gain = context.createGain();
      const time = start + .15 + i * .12 + Math.random() * .06;
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(90 + Math.random() * 130, time);
      gain.gain.setValueAtTime(.014, time);
      gain.gain.exponentialRampToValueAtTime(.0001, time + .035);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(time); oscillator.stop(time + .04);
    }
  }
  function boot() {
    booting = true;
    play('menu');
    startFan();
    if (context) disk();
    setTimeout(() => { booting = false; stopFan(); if (!muted) { startup.currentTime = 0; startup.play().catch(() => play('startup')); } }, 3300);
  }
  function replay() { if (!muted) { startup.currentTime = 0; startup.play().catch(() => play('startup')); } }
  return { play, boot, replay, silence() { stopFan(); startup.pause(); }, get ambience() { return ambience; }, setAmbience(value) {
    ambience = value;
    localStorage.setItem('desktop95-ambience', String(value));
    if (value) startFan(); else stopFan();
  }, get muted() { return muted; }, setMuted(value) {
    muted = value;
    localStorage.setItem('desktop95-muted', String(value));
    if (value) { stopFan(); startup.pause(); } else startFan();
  }};
})();
