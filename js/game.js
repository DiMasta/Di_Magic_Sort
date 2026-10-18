(function () {
  'use strict';

  // Ordered so that the first (easy) levels use the most distinct colors.
  var COLORS = [
    '#f2373b', // red
    '#1fa4ec', // blue
    '#ffcc1f', // yellow
    '#7cc417', // green
    '#8b2cf5', // purple
    '#f5801e', // orange
    '#ff5cc8', // pink
    '#3fe0d0', // cyan
    '#a0643c', // brown
    '#f2f2f7', // white
    '#1f8f4a', // dark green
    '#3448c5'  // navy
  ];
  var MAX_COLS = 8;
  var POUR_STEP = 0.16; // seconds for one layer to pour in
  var MAX_BOTTLE_W = 56;
  var MIN_BOTTLE_W = 24;
  var COL_GAP = 0.22; // gaps as a fraction of the bottle width
  var ROW_GAP = 0.45;

  var levelNo = parseInt(new URLSearchParams(location.search).get('level'), 10);
  if (!(levelNo >= 1 && levelNo <= LEVELS.length) || !Progress.isUnlocked(levelNo)) {
    location.replace('index.html');
    return;
  }

  var level = LEVELS[levelNo - 1];
  var capacity = level.capacity;
  // Bottle height / width, neck included.
  var ratio = 0.62 * capacity + 0.7;

  var board = document.getElementById('board');
  var controls = document.querySelector('.controls');
  var movesEl = document.getElementById('moves');
  var messageEl = document.getElementById('message');
  var undoBtn = document.getElementById('undo');
  var extraBtn = document.getElementById('extra');

  // state: { tubes, specs, moves, extraUsed }
  var state, history, selected, lastPour, won;

  document.getElementById('title').textContent = 'Level ' + levelNo;

  function shade(hex, amount) {
    var n = parseInt(hex.slice(1), 16);
    var target = amount < 0 ? 0 : 255;
    var t = Math.abs(amount);
    var rgb = [n >> 16, (n >> 8) & 255, n & 255].map(function (v) {
      return Math.round(v + (target - v) * t);
    });
    return 'rgb(' + rgb.join(',') + ')';
  }

  function colorVars(el, color) {
    var c = COLORS[color];
    el.style.setProperty('--c', c);
    el.style.setProperty('--l', shade(c, 0.35));
    el.style.setProperty('--d', shade(c, -0.25));
  }

  function start() {
    var s = Rules.setup(level);
    state = { tubes: s.tubes, specs: s.specs, moves: 0, extraUsed: false };
    history = [];
    selected = null;
    lastPour = null;
    won = false;
    render();
  }

  function saveHistory() {
    history.push({
      tubes: Rules.cloneTubes(state.tubes),
      specs: state.specs.slice(),
      moves: state.moves,
      extraUsed: state.extraUsed
    });
  }

  // Collectors are tall bottles spanning several rows: the first one on the
  // left (top rows), the second on the right (bottom rows), like the real game.
  function collectorSpan(rows, collectors) {
    return collectors === 2 && rows >= 3 ? rows - 1 : rows;
  }

  // Picks the grid (columns x rows) that gives the biggest bottles on screen.
  function computeLayout(normal, collectors) {
    var availW = board.clientWidth;
    var top = board.getBoundingClientRect().top + window.scrollY;
    var availH = Math.max(260, window.innerHeight - top - controls.offsetHeight - 70);
    var best = null;

    for (var cols = collectors + 1; cols <= MAX_COLS; cols++) {
      var rows = 1;
      while (cols * rows - collectors * collectorSpan(rows, collectors) < normal) rows++;
      var wByWidth = availW / (cols + (cols - 1) * COL_GAP);
      var wByHeight = availH / (rows * ratio + (rows - 1) * ROW_GAP + 0.4);
      var w = Math.max(MIN_BOTTLE_W, Math.min(MAX_BOTTLE_W, wByWidth, wByHeight));
      if (!best || w > best.w + 0.5 || (Math.abs(w - best.w) <= 0.5 && rows < best.rows)) {
        best = { cols: cols, rows: rows, w: Math.floor(w) };
      }
    }
    best.span = collectorSpan(best.rows, collectors);
    return best;
  }

  function makeBottle(tube, spec, i) {
    var el = document.createElement('div');
    el.className = 'bottle';
    if (i === selected) el.classList.add('selected');
    if (Rules.isCollector(spec)) el.classList.add('collector');
    var justPoured = lastPour && lastPour.to === i;

    var neck = document.createElement('div');
    neck.className = 'neck';
    el.appendChild(neck);

    if (Rules.isCapped(state.tubes, state.specs, i)) {
      el.classList.add('complete');
      // the cork sits inside the mouth, between the back and front of the lip
      var cap = document.createElement('div');
      cap.className = 'cap';
      if (justPoured) {
        // drop the cork in once the liquid has finished rising
        cap.classList.add('new');
        cap.style.animationDelay = lastPour.amount * POUR_STEP + 's';
      }
      neck.appendChild(cap);
    } else if (Rules.isTubeComplete(tube, spec)) {
      el.classList.add('complete');
    }

    var body = document.createElement('div');
    body.className = 'body';
    var liquid = document.createElement('div');
    liquid.className = 'liquid';
    liquid.style.setProperty('--cap', spec.capacity);

    tube.forEach(function (color, k) {
      var seg = document.createElement('div');
      seg.className = 'seg';
      colorVars(seg, color);
      if (k === tube.length - 1) seg.classList.add('top');
      var newIndex = k - (tube.length - (justPoured ? lastPour.amount : 0));
      if (justPoured && newIndex >= 0) {
        // poured layers rise one after another, bottom first
        seg.classList.add('new');
        seg.style.animationDelay = newIndex * POUR_STEP + 's';
      }
      liquid.appendChild(seg);
    });
    body.appendChild(liquid);
    el.appendChild(body);

    if (Rules.isCollector(spec)) {
      var rope = document.createElement('div');
      rope.className = 'rope';
      var tag = document.createElement('div');
      tag.className = 'tag';
      tag.appendChild(document.createElement('span'));
      colorVars(rope, spec.color);
      colorVars(tag, spec.color);
      el.appendChild(rope);
      el.appendChild(tag);
    }

    el.addEventListener('click', function () { onTubeClick(i, el); });
    return el;
  }

  function render() {
    var tubes = state.tubes;
    var specs = state.specs;
    var collectors = specs.filter(Rules.isCollector).length;
    var layout = computeLayout(tubes.length - collectors, collectors);

    board.style.setProperty('--cols', layout.cols);
    board.style.setProperty('--w', layout.w + 'px');
    board.style.setProperty('--ratio', ratio);
    board.style.setProperty('--pour-step', POUR_STEP + 's');
    board.style.setProperty('--col-gap', Math.round(layout.w * COL_GAP) + 'px');
    board.style.setProperty('--row-gap', Math.round(layout.w * ROW_GAP) + 'px');
    board.innerHTML = '';

    var placed = 0;
    tubes.forEach(function (tube, i) {
      var el = makeBottle(tube, specs[i], i);
      if (Rules.isCollector(specs[i])) {
        var first = placed++ === 0;
        el.style.gridColumn = first ? 1 : layout.cols;
        el.style.gridRow = (first ? 1 : layout.rows - layout.span + 1) + ' / span ' + layout.span;
      }
      board.appendChild(el);
    });

    movesEl.textContent = state.moves + (state.moves === 1 ? ' move' : ' moves');
    undoBtn.disabled = history.length === 0 || won;
    extraBtn.disabled = state.extraUsed || won;

    if (!won && !Rules.hasAnyMove(tubes, specs)) {
      messageEl.textContent = 'No more moves! Try Undo, Restart or +1 Tube.';
    } else {
      messageEl.textContent = '';
    }
  }

  function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth; // restart the animation
    el.classList.add('shake');
  }

  function canSelect(i) {
    return state.tubes[i].length > 0 &&
      !Rules.isCollector(state.specs[i]) &&
      !Rules.isCapped(state.tubes, state.specs, i);
  }

  function onTubeClick(i, el) {
    if (won) return;
    var tubes = state.tubes;
    var specs = state.specs;
    lastPour = null;

    if (selected === null) {
      if (!canSelect(i)) {
        Sound.error();
        return shake(el);
      }
      Sound.pick();
      selected = i;
    } else if (selected === i) {
      Sound.drop();
      selected = null;
    } else if (Rules.canPour(tubes, specs, selected, i)) {
      saveHistory();
      var before = tubes[i].length;
      var amount = Rules.pour(tubes, specs, selected, i);
      Sound.pour(amount, before, specs[i].capacity, POUR_STEP);
      lastPour = { to: i, amount: amount };
      state.moves++;
      selected = null;
      if (Rules.isCapped(tubes, specs, i)) Sound.fill(amount * POUR_STEP + 0.2);
      if (Rules.isSolved(tubes, specs)) return win();
    } else if (canSelect(i)) {
      // can't pour there: pick up the tapped bottle instead
      Sound.pick();
      selected = i;
    } else {
      Sound.error();
      shake(el);
      selected = null;
    }
    render();
  }

  function win() {
    won = true;
    // wait for the last pour (and its cork) to finish before celebrating
    var pourTime = lastPour.amount * POUR_STEP;
    Sound.win(pourTime + 0.5);
    render();
    Progress.complete(levelNo, state.moves);

    var next = document.getElementById('next');
    var text = 'You sorted level ' + levelNo + ' in ' + state.moves + ' moves.';
    if (levelNo < LEVELS.length) {
      next.href = 'level.html?level=' + (levelNo + 1);
      next.hidden = false;
    } else {
      text += ' That was the last level. Amazing!';
      next.hidden = true;
    }
    document.getElementById('win-text').textContent = text;
    setTimeout(function () {
      document.getElementById('win').hidden = false;
    }, (pourTime + 0.7) * 1000);
  }

  undoBtn.addEventListener('click', function () {
    if (!history.length || won) return;
    state = history.pop();
    selected = null;
    lastPour = null;
    render();
  });

  document.getElementById('restart').addEventListener('click', function () {
    document.getElementById('win').hidden = true;
    start();
  });

  extraBtn.addEventListener('click', function () {
    if (state.extraUsed || won) return;
    saveHistory();
    state.tubes.push([]);
    state.specs.push({ capacity: capacity });
    state.extraUsed = true;
    selected = null;
    lastPour = null;
    render();
  });

  var soundBtn = document.getElementById('sound');
  function showSound() {
    soundBtn.textContent = Sound.isMuted() ? '\uD83D\uDD07' : '\uD83D\uDD0A';
  }
  soundBtn.addEventListener('click', function () {
    Sound.setMuted(!Sound.isMuted());
    showSound();
    Sound.pick();
  });
  showSound();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      lastPour = null;
      render();
    }, 150);
  });

  start();
})();
