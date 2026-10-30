// Core game rules, shared by the browser game and the level generator (Node).
// A tube is an array of color indices, bottom -> top. Each tube has a spec:
//   { capacity: n }                 a normal bottle
//   { capacity: n, color: c }       a collector: a big bottle that only takes
//                                   color c, holds all of it, and can't be
//                                   poured from.
//   { capacity: n, color: -1 }      an open collector: the same, but it has no
//                                   tag and takes whichever color is poured
//                                   into it first.
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
  //   { capacity, tubes: [[...], ...], collectors: [color or -1, ...] }
  // Collectors start empty and come after the normal tubes. A collector
  // holds all of its color; an open one holds as much as the biggest color.
  function setup(level) {
    var tubes = level.tubes.map(function (t) { return t.slice(); });
    var specs = tubes.map(function () { return { capacity: level.capacity }; });
    var totals = {};
    level.tubes.forEach(function (t) {
      t.forEach(function (c) { totals[c] = (totals[c] || 0) + 1; });
    });
    var biggest = Math.max.apply(null, Object.keys(totals).map(function (c) { return totals[c]; }));
    (level.collectors || []).forEach(function (color) {
      tubes.push([]);
      specs.push({ capacity: color === -1 ? biggest : totals[color], color: color });
    });
    return { tubes: tubes, specs: specs };
  }

  // Can collector j still take color c?
  function collectorTakes(tubes, specs, j, c) {
    var spec = specs[j];
    var tube = tubes[j];
    if (tube.length >= spec.capacity) return false;
    if (spec.color === -1) return !tube.length || tube[0] === c;
    return spec.color === c;
  }

  function isTubeComplete(tube, spec) {
    return tube.length === spec.capacity && isUniform(tube);
  }

  // A finished bottle gets a cap and can't be used any more: a full
  // collector, or a full single-color bottle that no collector could still
  // take (if one could, the bottle may still have to be poured into it).
  function isCapped(tubes, specs, i) {
    var spec = specs[i];
    if (isCollector(spec)) return tubes[i].length === spec.capacity;
    if (!isTubeComplete(tubes[i], spec)) return false;
    var color = tubes[i][0];
    return !specs.some(function (s, j) {
      return isCollector(s) && collectorTakes(tubes, specs, j, color);
    });
  }

  function canPour(tubes, specs, i, j) {
    if (i === j) return false;
    var from = tubes[i];
    var to = tubes[j];
    if (!from.length || isCollector(specs[i]) || isCapped(tubes, specs, i)) return false;
    if (to.length >= specs[j].capacity) return false;
    var c = topColor(from);
    if (isCollector(specs[j])) return collectorTakes(tubes, specs, j, c);
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
    isCapped: isCapped,
    isSolved: isSolved,
    hasAnyMove: hasAnyMove,
    cloneTubes: cloneTubes
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Rules;
  else root.Rules = Rules;
})(this);
