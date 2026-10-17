// Small sound effects, synthesized with the Web Audio API (no sound files).
var Sound = (function () {
  'use strict';
  var KEY = 'magicSort.muted';
  var ctx = null;
  var muted = false;
  try { muted = localStorage.getItem(KEY) === '1'; } catch (e) { /* no storage */ }

  // Browsers only allow audio after a tap, so the context is made lazily.
  function audio() {
    if (muted) return null;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // One short tone whose pitch glides from f1 to f2.
  function tone(f1, f2, start, duration, type, volume) {
    var a = audio();
    if (!a) return;
    var t = a.currentTime + start;
    var osc = a.createOscillator();
    var gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.exponentialRampToValueAtTime(f2, t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(a.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  function notes(freqs, gap, duration, start) {
    freqs.forEach(function (f, i) {
      tone(f, f, (start || 0) + i * gap, duration, 'triangle', 0.16);
    });
  }

  return {
    // Lifting a bottle: a quick rising "pop".
    pick: function () { tone(520, 880, 0, 0.09, 'sine', 0.18); },
    // Putting a bottle back down: a falling "pop".
    drop: function () { tone(700, 380, 0, 0.1, 'sine', 0.16); },
    // Pouring: bubbly glugs whose pitch rises as the bottle fills up.
    pour: function (amount, filledBefore, capacity) {
      var count = 3 + amount * 2;
      for (var i = 0; i < count; i++) {
        var level = (filledBefore + (amount * i) / count) / capacity;
        var f = 260 + level * 520 + Math.random() * 60;
        tone(f, f * 1.5, i * 0.05, 0.06, 'sine', 0.15);
      }
    },
    // A bottle got full and capped: a little chime.
    fill: function (delay) { notes([784, 988, 1319], 0.08, 0.25, delay); },
    // Level complete.
    win: function (delay) { notes([523, 659, 784, 1047, 1319], 0.11, 0.35, delay); },
    // Tapping something that can't be used.
    error: function () { tone(220, 150, 0, 0.12, 'square', 0.04); },

    isMuted: function () { return muted; },
    setMuted: function (value) {
      muted = value;
      try { localStorage.setItem(KEY, value ? '1' : '0'); } catch (e) { /* no storage */ }
    }
  };
})();
