// Core game rules, shared by the browser game and the level generator (Node).
// A tube is an array of color indices, bottom -> top.
(function (root) {
  'use strict';

  function topColor(tube) {
    return tube.length ? tube[tube.length - 1] : -1;
  }

  // How many layers of the same color sit on top of the tube.
  function topRun(tube) {
    var n = 0;
    var c = topColor(tube);
    for (var i = tube.length - 1; i >= 0 && tube[i] === c; i--) n++;
    return n;
  }

  function isUniform(tube) {
    for (var i = 1; i < tube.length; i++) if (tube[i] !== tube[0]) return false;
    return true;
  }

  function canPour(from, to, capacity) {
    if (from === to || !from.length) return false;
    if (to.length >= capacity) return false;
    return !to.length || topColor(to) === topColor(from);
  }

  // Pours as much of the top color as fits. Returns the number of layers moved.
  function pour(from, to, capacity) {
    if (!canPour(from, to, capacity)) return 0;
    var amount = Math.min(topRun(from), capacity - to.length);
    for (var i = 0; i < amount; i++) to.push(from.pop());
    return amount;
  }

  function isTubeComplete(tube, capacity) {
    return tube.length === capacity && isUniform(tube);
  }

  function isSolved(tubes, capacity) {
    return tubes.every(function (t) {
      return t.length === 0 || isTubeComplete(t, capacity);
    });
  }

  function hasAnyMove(tubes, capacity) {
    for (var i = 0; i < tubes.length; i++)
      for (var j = 0; j < tubes.length; j++)
        if (i !== j && canPour(tubes[i], tubes[j], capacity)) return true;
    return false;
  }

  function cloneTubes(tubes) {
    return tubes.map(function (t) { return t.slice(); });
  }

  var Rules = {
    topColor: topColor,
    topRun: topRun,
    isUniform: isUniform,
    canPour: canPour,
    pour: pour,
    isTubeComplete: isTubeComplete,
    isSolved: isSolved,
    hasAnyMove: hasAnyMove,
    cloneTubes: cloneTubes
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Rules;
  else root.Rules = Rules;
})(this);
