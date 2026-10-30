#!/usr/bin/env node
// Generates js/levels.js: a fixed list of shuffled levels, each one checked
// with a solver so every level is guaranteed to be solvable.
//
//   node tools/generate-levels.js
'use strict';

const fs = require('fs');
const path = require('path');
const Rules = require('../js/rules.js');

// Difficulty curve: [number of levels, colors, empty tubes, tube capacity].
const PLAN = [
  [2, 2, 1, 4],
  [3, 3, 2, 4],
  [5, 4, 2, 4],
  [5, 5, 2, 4],
  [5, 6, 2, 4],
  [5, 7, 2, 4],
  [5, 8, 2, 4],
  [5, 9, 2, 4],
  [5, 10, 2, 4],
  [5, 11, 2, 4],
  [5, 12, 2, 4],
  [5, 8, 2, 5],
  [5, 10, 2, 5],
  [5, 12, 2, 5],
  [5, 10, 2, 6],
  [5, 12, 2, 6]
];

// "Big" levels, like the real game's: few colors spread over many bottles,
// plus collector bottles that gather all of one color. Tagged collectors
// take one given color; open collectors (no tag) take whichever color is
// poured in first. With no empty bottles, the collector is the only space.
// [number of levels, colors, bottles per color, empty bottles, tagged, open].
const BIG_PLAN = [
  [1, 3, 2, 2, 1, 0],
  [1, 4, 2, 2, 1, 0],
  [1, 4, 3, 2, 1, 0],
  [1, 5, 3, 2, 2, 0],
  [1, 6, 3, 2, 2, 0],
  [1, 6, 3, 1, 0, 1],
  [2, 6, 4, 2, 2, 0],
  [1, 6, 4, 0, 1, 0],
  [1, 6, 4, 0, 0, 1],
  [2, 7, 4, 2, 2, 0],
  [1, 7, 4, 1, 1, 1],
  [2, 8, 4, 2, 2, 0]
];
const BIG_CAPACITY = 4;
// Palette indices used by big levels (yellow, green, pink, purple, blue, orange, red, cyan).
const BIG_COLORS = [2, 3, 6, 4, 1, 5, 0, 7];
// Every BIG_EVERY-th level is a big level.
const BIG_EVERY = 5;

const CANDIDATES_PER_LEVEL = 40;
const SOLVER_NODE_LIMIT = 200000;

// Small deterministic PRNG so the levels are the same every time.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomPuzzle(colors, empty, capacity, rand, perColor = 1) {
  const pool = [];
  for (let c = 0; c < colors; c++) for (let k = 0; k < capacity * perColor; k++) pool.push(c);
  shuffle(pool, rand);
  const tubes = [];
  for (let i = 0; i < colors * perColor; i++) tubes.push(pool.slice(i * capacity, (i + 1) * capacity));
  for (let i = 0; i < empty; i++) tubes.push([]);
  return tubes;
}

// Number of color changes inside tubes: a rough "how mixed is it" score.
function mixScore(tubes) {
  let s = 0;
  for (const t of tubes) for (let i = 1; i < t.length; i++) if (t[i] !== t[i - 1]) s++;
  return s;
}

// Depth-first search with a visited set. Returns the move list or null.
function solve(level, nodeLimit) {
  const { tubes: start, specs } = Rules.setup(level);
  const normal = specs.filter((sp) => !Rules.isCollector(sp)).length;
  const seen = new Set();
  const moves = [];
  let nodes = 0;
  // Normal tubes are interchangeable; collectors are not (and an open one
  // also remembers which color it took).
  const key = (tubes) =>
    tubes.slice(0, normal).map((t) => t.join(',')).sort().join('|') +
    '#' + tubes.slice(normal).map((t) => t.length + ':' + (t.length ? t[0] : '')).join(',');

  function dfs(tubes) {
    if (Rules.isSolved(tubes, specs)) return true;
    if (++nodes > nodeLimit) return false;
    const k = key(tubes);
    if (seen.has(k)) return false;
    seen.add(k);

    const options = [];
    for (let i = 0; i < tubes.length; i++) {
      const from = tubes[i];
      const done = Rules.isTubeComplete(from, specs[i]);
      let triedEmpty = false;
      for (let j = 0; j < tubes.length; j++) {
        if (!Rules.canPour(tubes, specs, i, j)) continue;
        const to = tubes[j];
        let priority;
        if (Rules.isCollector(specs[j])) {
          priority = 0;
        } else if (done) {
          continue; // a finished bottle only needs to go to a collector
        } else if (!to.length) {
          // Moving a single-color tube into an empty one is pointless,
          // and all empty tubes are equivalent.
          if (Rules.isUniform(from) || triedEmpty) continue;
          triedEmpty = true;
          priority = 2;
        } else {
          priority = 1;
        }
        options.push([i, j, priority]);
      }
    }
    options.sort((a, b) => a[2] - b[2]);

    for (const [i, j] of options) {
      const next = Rules.cloneTubes(tubes);
      Rules.pour(next, specs, i, j);
      moves.push([i, j]);
      if (dfs(next)) return true;
      moves.pop();
    }
    return false;
  }

  return dfs(start) ? moves.slice() : null;
}

function pickLevel(seed, label, makeLevel) {
  const rand = mulberry32(seed);
  let best = null;
  for (let c = 0; c < CANDIDATES_PER_LEVEL; c++) {
    const level = makeLevel(rand);
    if (level.tubes.some((t) => Rules.isTubeComplete(t, { capacity: level.capacity }))) continue;
    const score = mixScore(level.tubes);
    if (best && score <= best.score) continue;
    const solution = solve(level, SOLVER_NODE_LIMIT);
    if (solution) best = { level, score, solution };
  }
  if (!best) throw new Error(`Could not build a solvable ${label}`);
  console.log(`${label}: solver found ${best.solution.length} moves`);
  return best.level;
}

function generate() {
  const normal = [];
  for (const [count, colors, empty, capacity] of PLAN) {
    for (let n = 0; n < count; n++) {
      const no = normal.length + 1;
      normal.push(
        pickLevel(no * 7919 + 13, `normal ${no} (${colors} colors, capacity ${capacity})`, (rand) => ({
          capacity,
          tubes: randomPuzzle(colors, empty, capacity, rand)
        }))
      );
    }
  }

  const big = [];
  for (const [count, colors, perColor, empty, tagged, open] of BIG_PLAN) {
    for (let n = 0; n < count; n++) {
      const no = big.length + 1;
      const label = `big ${no} (${colors} colors, ${colors * perColor + empty} bottles, ` +
        `${tagged} tagged + ${open} open collectors)`;
      big.push(
        pickLevel(no * 104729 + 7, label, (rand) => {
          const tubes = randomPuzzle(colors, empty, BIG_CAPACITY, rand, perColor)
            .map((t) => t.map((c) => BIG_COLORS[c]));
          const picks = shuffle(BIG_COLORS.slice(0, colors), rand).slice(0, tagged);
          for (let k = 0; k < open; k++) picks.push(-1);
          return { capacity: BIG_CAPACITY, tubes, collectors: picks };
        })
      );
    }
  }

  const levels = [];
  while (normal.length || big.length) {
    const isBig = (levels.length + 1) % BIG_EVERY === 0;
    levels.push(isBig && big.length ? big.shift() : normal.shift() || big.shift());
  }
  return levels;
}

if (require.main === module) {
  const levels = generate();
  const body = levels
    .map((l) => {
      const collectors = l.collectors ? `, collectors: ${JSON.stringify(l.collectors)}` : '';
      return `  { capacity: ${l.capacity}, tubes: ${JSON.stringify(l.tubes)}${collectors} }`;
    })
    .join(',\n');
  const out =
    '// Generated by tools/generate-levels.js. Do not edit by hand.\n' +
    'var LEVELS = [\n' + body + '\n];\n';
  fs.writeFileSync(path.join(__dirname, '..', 'js', 'levels.js'), out);
  console.log(`Wrote ${levels.length} levels to js/levels.js`);
}

module.exports = { solve };
