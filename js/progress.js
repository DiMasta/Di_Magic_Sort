// Remembers which levels have been completed (stored in the browser).
var Progress = (function () {
  'use strict';
  var KEY = 'magicSort.progress.v1';

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY));
      if (data && data.best) return data;
    } catch (e) { /* storage unavailable or corrupt */ }
    return { best: {} };
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { /* storage unavailable */ }
  }

  return {
    isCompleted: function (level) {
      return load().best[level] !== undefined;
    },
    bestMoves: function (level) {
      return load().best[level];
    },
    isUnlocked: function (level) {
      return level === 1 || this.isCompleted(level - 1) || this.isCompleted(level);
    },
    complete: function (level, moves) {
      var data = load();
      var prev = data.best[level];
      if (prev === undefined || moves < prev) data.best[level] = moves;
      save(data);
    },
    reset: function () {
      save({ best: {} });
    }
  };
})();
