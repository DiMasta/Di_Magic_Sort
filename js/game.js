(function () {
  'use strict';

  // Ordered so that the first (easy) levels use the most distinct colors.
  var COLORS = [
    '#e53935', // red
    '#1e88e5', // blue
    '#fdd835', // yellow
    '#7cb342', // green
    '#8e24aa', // purple
    '#fb8c00', // orange
    '#f48fb1', // pink
    '#4dd0e1', // cyan
    '#795548', // brown
    '#f5f5f5', // white
    '#1b5e20', // dark green
    '#5c6bc0'  // indigo
  ];
  var MAX_PER_ROW = 7;

  var levelNo = parseInt(new URLSearchParams(location.search).get('level'), 10);
  if (!(levelNo >= 1 && levelNo <= LEVELS.length) || !Progress.isUnlocked(levelNo)) {
    location.replace('index.html');
    return;
  }

  var level = LEVELS[levelNo - 1];
  var capacity = level.capacity;

  var board = document.getElementById('board');
  var movesEl = document.getElementById('moves');
  var messageEl = document.getElementById('message');
  var undoBtn = document.getElementById('undo');
  var extraBtn = document.getElementById('extra');

  // state: { tubes, moves, extraUsed }
  var state, history, selected, lastPour, won;

  document.getElementById('title').textContent = 'Level ' + levelNo;
  board.style.setProperty('--capacity', capacity);
  board.classList.toggle('tall', capacity > 4);

  function start() {
    state = { tubes: Rules.cloneTubes(level.tubes), moves: 0, extraUsed: false };
    history = [];
    selected = null;
    lastPour = null;
    won = false;
    render();
  }

  function saveHistory() {
    history.push({
      tubes: Rules.cloneTubes(state.tubes),
      moves: state.moves,
      extraUsed: state.extraUsed
    });
  }

  function render() {
    var tubes = state.tubes;
    var rows = Math.ceil(tubes.length / MAX_PER_ROW);
    board.style.setProperty('--per-row', Math.ceil(tubes.length / rows));
    board.innerHTML = '';

    tubes.forEach(function (tube, i) {
      var el = document.createElement('div');
      el.className = 'tube';
      if (i === selected) el.classList.add('selected');
      if (Rules.isTubeComplete(tube, capacity)) el.classList.add('complete');

      tube.forEach(function (color, k) {
        var seg = document.createElement('div');
        seg.className = 'seg';
        seg.style.background = COLORS[color];
        if (lastPour && lastPour.to === i && k >= tube.length - lastPour.amount) {
          seg.classList.add('new');
        }
        el.appendChild(seg);
      });

      el.addEventListener('click', function () { onTubeClick(i, el); });
      board.appendChild(el);
    });

    movesEl.textContent = state.moves + (state.moves === 1 ? ' move' : ' moves');
    undoBtn.disabled = history.length === 0 || won;
    extraBtn.disabled = state.extraUsed || won;

    if (!won && !Rules.hasAnyMove(tubes, capacity)) {
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

  function onTubeClick(i, el) {
    if (won) return;
    var tubes = state.tubes;
    lastPour = null;

    if (selected === null) {
      if (tubes[i].length === 0) return shake(el);
      selected = i;
    } else if (selected === i) {
      selected = null;
    } else if (Rules.canPour(tubes[selected], tubes[i], capacity)) {
      saveHistory();
      var amount = Rules.pour(tubes[selected], tubes[i], capacity);
      lastPour = { to: i, amount: amount };
      state.moves++;
      selected = null;
      if (Rules.isSolved(tubes, capacity)) return win();
    } else {
      shake(el);
      selected = tubes[i].length ? i : null;
    }
    render();
  }

  function win() {
    won = true;
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
    }, 400);
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
    state.extraUsed = true;
    selected = null;
    lastPour = null;
    render();
  });

  start();
})();
