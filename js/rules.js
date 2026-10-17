// Core game rules, shared by the browser game and the level generator (Node).
// A tube is an array of color indices, bottom -> top. Each tube has a spec:
//   { capacity: n }                 a normal bottle
//   { capacity: n, color: c }       a collector: a big bottle that only takes
//                                   color c, holds all of it, and can't be
//                                   poured from.
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

  function isCollector(spec) {
    return spec.color !== undefined;
  }

  // Builds the starting tubes and specs of a level. Level format:
  //   { capacity, tubes: [[...], ...], collectors: [color, ...] }
  // Collectors start empty and come after the normal tubes.
  function setup(level) {
    var tubes = level.tubes.map(function (t) { return t.slice(); });
    var specs = tubes.map(function () { return { capacity: level.capacity }; });
    (level.collectors || []).forEach(function (color) {
      var total = 0;
      level.tubes.forEach(function (t) {
        t.forEach(function (c) { if (c === color) total++; });
      });
      tubes.push([]);
      specs.push({ capacity: total, color: color });
    });
    return { tubes: tubes, specs: specs };
  }

  function canPour(tubes, specs, i, j) {
    if (i === j) return false;
    var from = tubes[i];
    var to = tubes[j];
    if (!from.length || isCollector(specs[i])) return false;
    if (to.length >= specs[j].capacity) return false;
    var c = topColor(from);
    if (isCollector(specs[j])) return c === specs[j].color;
    return !to.length || topColor(to) === c;
  }

  // Pours as much of the top color as fits. Returns the number of layers moved.
  function pour(tubes, specs, i, j) {
    if (!canPour(tubes, specs, i, j)) return 0;
    var from = tubes[i];
    var to = tubes[j];
    var amount = Math.min(topRun(from), specs[j].capacity - to.length);
    for (var k = 0; k < amount; k++) to.push(from.pop());
    return amount;
  }

  function isTubeComplete(tube, spec) {
    return tube.length === spec.capacity && isUniform(tube);
  }

  // Solved when every normal tube is empty or full of one color,
  // and every collector is full.
  function isSolved(tubes, specs) {
    return tubes.every(function (t, i) {
      if (isCollector(specs[i])) return t.length === specs[i].capacity;
      return t.length === 0 || isTubeComplete(t, specs[i]);
    });
  }

  function hasAnyMove(tubes, specs) {
    for (var i = 0; i < tubes.length; i++)
      for (var j = 0; j < tubes.length; j++)
        if (canPour(tubes, specs, i, j)) return true;
    return false;
  }

  function cloneTubes(tubes) {
    return tubes.map(function (t) { return t.slice(); });
  }

  var Rules = {
    topColor: topColor,
    topRun: topRun,
    isUniform: isUniform,
    isCollector: isCollector,
    setup: setup,
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
