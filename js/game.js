(function () {
  'use strict';

  // Simple background textures: faint white patterns drawn with CSS
  // gradients, so they work on any background color.
  var W = 'rgba(255,255,255,';
  var TEXTURES = {
    stars: {
      image: 'radial-gradient(1.5px 1.5px at 20px 30px, ' + W + '.45), transparent),' +
        'radial-gradient(1px 1px at 80px 70px, ' + W + '.4), transparent),' +
        'radial-gradient(1.5px 1.5px at 140px 20px, ' + W + '.3), transparent),' +
        'radial-gradient(1px 1px at 110px 130px, ' + W + '.4), transparent),' +
        'radial-gradient(2px 2px at 40px 150px, ' + W + '.25), transparent)',
      size: '170px 170px'
    },
    dots: {
      image: 'radial-gradient(circle, ' + W + '.07) 2.5px, transparent 3px)',
      size: '24px 24px'
    },
    grid: {
      image: 'linear-gradient(' + W + '.05) 1px, transparent 1px),' +
        'linear-gradient(90deg, ' + W + '.05) 1px, transparent 1px)',
      size: '32px 32px'
    },
    checks: {
      image: 'conic-gradient(' + W + '.045) 90deg, transparent 90deg 180deg, ' +
        W + '.045) 180deg 270deg, transparent 270deg)',
      size: '48px 48px'
    },
    stripes: {
      image: 'repeating-linear-gradient(45deg, ' + W + '.045) 0 14px, transparent 14px 28px)',
      size: 'auto'
    },
    scales: {
      image: 'radial-gradient(circle at 50% 0, transparent 13px, ' + W + '.06) 14px, ' +
        W + '.06) 16px, transparent 17px)',
      size: '32px 16px'
    },
    bubbles: {
      image: 'radial-gradient(circle at 30% 30%, ' + W + '.07) 0 14px, transparent 15px),' +
        'radial-gradient(circle at 75% 70%, ' + W + '.05) 0 22px, transparent 23px),' +
        'radial-gradient(circle at 82% 15%, ' + W + '.06) 0 6px, transparent 7px)',
      size: '140px 140px'
    },
    ripples: {
      image: 'repeating-radial-gradient(circle at 0 0, transparent 0 18px, ' + W + '.045) 18px 20px)',
      size: '80px 80px'
    },
    tiles: {
      image: 'linear-gradient(45deg, ' + W + '.045) 25%, transparent 25% 75%, ' + W + '.045) 75%),' +
        'linear-gradient(45deg, ' + W + '.045) 25%, transparent 25% 75%, ' + W + '.045) 75%)',
      size: '40px 40px',
      position: '0 0, 20px 20px'
    },
    plaid: {
      image: 'repeating-linear-gradient(0deg, ' + W + '.04) 0 10px, transparent 10px 40px),' +
        'repeating-linear-gradient(90deg, ' + W + '.04) 0 10px, transparent 10px 40px)',
      size: 'auto'
    },
    zigzag: {
      image: 'linear-gradient(135deg, ' + W + '.05) 25%, transparent 25%),' +
        'linear-gradient(225deg, ' + W + '.05) 25%, transparent 25%)',
      size: '40px 40px'
    }
  };

  // Color themes, like the real game's: each one has its own set of liquid
  // colors and 5 backgrounds (a color and a texture) that suit them. The
  // themes take turns every 5 levels, and each of those levels gets one of
  // the theme's backgrounds.
  // Levels store color numbers; a theme says which color each number is.
  // Numbers 0-7 are used the most (big levels use 2, 3, 6, 4, 1, 5, 0, 7),
  // so those are the most distinct colors in every theme.
  var THEMES = [
    {
      name: 'night',
      backgrounds: [
        ['#403f6b', 'stars'],   // purple
        ['#55304f', 'dots'],    // berry
        ['#394660', 'grid'],    // slate
        ['#4a3a35', 'checks'],  // cocoa
        ['#26395c', 'scales']   // ocean
      ],
      colors: [
        '#f2373b', // 0 red
        '#1fa4ec', // 1 blue
        '#ffcc1f', // 2 yellow
        '#7cc417', // 3 green
        '#8b2cf5', // 4 purple
        '#f5801e', // 5 orange
        '#ff5cc8', // 6 pink
        '#3fe0d0', // 7 cyan
        '#a0643c', // 8 brown
        '#f2f2f7', // 9 white
        '#1f8f4a', // 10 dark green
        '#3448c5'  // 11 navy
      ]
    },
    {
      // earthy colors on grey, like the real game's "coffee" levels
      name: 'stone',
      backgrounds: [
        ['#4b5254', 'tiles'],   // grey
        ['#45524a', 'stripes'], // sage
        ['#455060', 'ripples'], // blue grey
        ['#57504b', 'plaid'],   // warm grey
        ['#39484b', 'zigzag']   // charcoal
      ],
      colors: [
        '#2f8a8f', // 0 teal
        '#e3833f', // 1 orange
        '#f2bd1d', // 2 yellow
        '#a8998a', // 3 taupe
        '#9c5a6d', // 4 mauve
        '#efefef', // 5 white
        '#6b1d24', // 6 maroon
        '#7f9a3a', // 7 olive
        '#2e3f78', // 8 navy
        '#d0577f', // 9 raspberry
        '#56a3d9', // 10 sky blue
        '#2b2b2b'  // 11 black
      ]
    },
    {
      // bright colors with white and red on deep teal
      name: 'lagoon',
      backgrounds: [
        ['#22505a', 'bubbles'], // teal
        ['#23493b', 'scales'],  // deep green
        ['#1f3340', 'stars'],   // midnight
        ['#2e2f63', 'zigzag'],  // indigo
        ['#4f2533', 'dots']     // wine
      ],
      colors: [
        '#8c3bf0', // 0 purple
        '#2196f3', // 1 blue
        '#f9c623', // 2 yellow
        '#6cbf2a', // 3 green
        '#f4f4f4', // 4 white
        '#ff5fb8', // 5 pink
        '#e8262f', // 6 red
        '#f57c1f', // 7 orange
        '#7a4a2a', // 8 brown
        '#1d2f8f', // 9 navy
        '#c6e84a', // 10 lime
        '#b0b0b0'  // 11 grey
      ]
    }
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
  var theme = THEMES[Math.floor((levelNo - 1) / 5) % THEMES.length];
  var background = theme.backgrounds[(levelNo - 1) % theme.backgrounds.length];
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

  // Mixes a color toward white (amount > 0) or black (amount < 0) as hex.
  function mix(hex, amount) {
    return '#' + shade(hex, amount).match(/\d+/g).map(function (v) {
      return ('0' + Number(v).toString(16)).slice(-2);
    }).join('');
  }

  // Sets the level's background, and the glass and text shades that go
  // with it (all worked out from the background color).
  function applyTheme() {
    var root = document.documentElement.style;
    var bg = background[0];
    var texture = TEXTURES[background[1]];
    root.setProperty('--bg', bg);
    root.setProperty('--bg-2', mix(bg, 0.08));
    root.setProperty('--glass-edge', mix(bg, 0.48));
    root.setProperty('--muted', mix(bg, 0.66));
    root.setProperty('--glass-1', mix(bg, 0.16));
    root.setProperty('--glass-2', mix(bg, 0.10));
    root.setProperty('--glass-3', mix(bg, 0.08));
    root.setProperty('--glass-4', mix(bg, 0.14));
    root.setProperty('--lip-1', mix(bg, 0.22));
    root.setProperty('--lip-2', mix(bg, 0.17));
    root.setProperty('--hole-1', mix(bg, -0.27));
    root.setProperty('--hole-2', mix(bg, -0.05));
    root.setProperty('--texture', texture.image);
    root.setProperty('--texture-size', texture.size);
    root.setProperty('--texture-position', texture.position || '0 0');
    document.body.dataset.theme = theme.name;
    document.body.dataset.texture = background[1];
  }

  function colorVars(el, color) {
    var c = theme.colors[color];
    el.style.setProperty('--c', c);
    el.style.setProperty('--l', shade(c, 0.35));
    el.style.setProperty('--d', shade(c, -0.25));
  }

  applyTheme();

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

  // Collectors are tall bottles spanning several rows, like the real game:
  // a single one stands in the middle column, from top to bottom; with two,
  // the first is on the left (top rows) and the second on the right (bottom).
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
    if (spec.color === -1) el.classList.add('open');
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

    // a tagged collector has a rope and a tag showing its color;
    // an open one is a plain tall bottle
    if (Rules.isCollector(spec) && spec.color !== -1) {
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
        if (collectors === 1) {
          el.style.gridColumn = Math.ceil(layout.cols / 2);
          el.style.gridRow = '1 / span ' + layout.span;
        } else {
          el.style.gridColumn = first ? 1 : layout.cols;
          el.style.gridRow = (first ? 1 : layout.rows - layout.span + 1) + ' / span ' + layout.span;
        }
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
