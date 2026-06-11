const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const timerEl = document.querySelector('#timer');
const stateEl = document.querySelector('#state');

const input = new Set();
const bounds = { width: canvas.width, height: canvas.height };

const playerStart = {
  x: bounds.width / 2,
  y: bounds.height / 2,
  radius: 16,
  speed: 260
};

let game;
let lastTime = 0;

function resetGame() {
  game = {
    player: { ...playerStart },
    enemies: [],
    score: 0,
    elapsed: 0,
    spawnTimer: 0,
    spawnEvery: 1.1,
    running: true,
    gameOver: false
  };
  lastTime = performance.now();
  updateHud('Running');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function length(x, y) {
  return Math.hypot(x, y) || 1;
}

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  const radius = 12 + Math.random() * 10;
  let x;
  let y;

  if (side === 0) {
    x = Math.random() * bounds.width;
    y = -radius;
  } else if (side === 1) {
    x = bounds.width + radius;
    y = Math.random() * bounds.height;
  } else if (side === 2) {
    x = Math.random() * bounds.width;
    y = bounds.height + radius;
  } else {
    x = -radius;
    y = Math.random() * bounds.height;
  }

  const targetX = game.player.x - x;
  const targetY = game.player.y - y;
  const distance = length(targetX, targetY);
  const speed = 95 + Math.min(game.elapsed * 3, 95) + Math.random() * 35;

  game.enemies.push({
    x,
    y,
    radius,
    vx: (targetX / distance) * speed,
    vy: (targetY / distance) * speed
  });
}

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (input.has('arrowleft') || input.has('a')) dx -= 1;
  if (input.has('arrowright') || input.has('d')) dx += 1;
  if (input.has('arrowup') || input.has('w')) dy -= 1;
  if (input.has('arrowdown') || input.has('s')) dy += 1;

  if (dx !== 0 || dy !== 0) {
    const distance = length(dx, dy);
    game.player.x += (dx / distance) * game.player.speed * dt;
    game.player.y += (dy / distance) * game.player.speed * dt;
  }

  game.player.x = clamp(game.player.x, game.player.radius, bounds.width - game.player.radius);
  game.player.y = clamp(game.player.y, game.player.radius, bounds.height - game.player.radius);
}

function updateEnemies(dt) {
  for (const enemy of game.enemies) {
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;
  }

  game.enemies = game.enemies.filter((enemy) => {
    return enemy.x > -80 && enemy.x < bounds.width + 80 && enemy.y > -80 && enemy.y < bounds.height + 80;
  });
}

function checkCollisions() {
  for (const enemy of game.enemies) {
    const dx = enemy.x - game.player.x;
    const dy = enemy.y - game.player.y;
    if (Math.hypot(dx, dy) < enemy.radius + game.player.radius) {
      game.running = false;
      game.gameOver = true;
      updateHud('Game Over');
      return;
    }
  }
}

function update(dt) {
  if (!game.running || game.gameOver) return;

  game.elapsed += dt;
  game.score += dt * 10;
  game.spawnTimer += dt;
  game.spawnEvery = Math.max(0.38, 1.1 - game.elapsed * 0.015);

  updatePlayer(dt);
  updateEnemies(dt);

  while (game.spawnTimer >= game.spawnEvery) {
    game.spawnTimer -= game.spawnEvery;
    spawnEnemy();
  }

  checkCollisions();
  updateHud('Running');
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;

  for (let x = 0; x <= bounds.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, bounds.height);
    ctx.stroke();
  }

  for (let y = 0; y <= bounds.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(bounds.width, y);
    ctx.stroke();
  }
}

function drawCircle(entity, fill, stroke) {
  ctx.beginPath();
  ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function render() {
  ctx.clearRect(0, 0, bounds.width, bounds.height);
  ctx.fillStyle = '#151b21';
  ctx.fillRect(0, 0, bounds.width, bounds.height);
  drawGrid();

  for (const enemy of game.enemies) {
    drawCircle(enemy, '#ef6f6c', '#ffd0ce');
  }

  drawCircle(game.player, '#58d6b3', '#dcfff5');

  if (game.gameOver) {
    drawOverlay('Game Over', 'Press R to restart');
  } else if (!game.running) {
    drawOverlay('Paused', 'Press Space to resume');
  }
}

function drawOverlay(title, subtitle) {
  ctx.fillStyle = 'rgba(5, 8, 12, 0.62)';
  ctx.fillRect(0, 0, bounds.width, bounds.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 48px system-ui, sans-serif';
  ctx.fillText(title, bounds.width / 2, bounds.height / 2 - 14);

  ctx.fillStyle = '#c9d4dd';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText(subtitle, bounds.width / 2, bounds.height / 2 + 28);
}

function updateHud(label) {
  scoreEl.textContent = Math.floor(game.score).toString();
  timerEl.textContent = `${game.elapsed.toFixed(1)}s`;
  stateEl.textContent = label;
}

function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  update(dt);
  render();
  requestAnimationFrame(frame);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
    event.preventDefault();
  }

  if (key === 'r') {
    resetGame();
    return;
  }

  if (key === ' ') {
    if (!game.gameOver) {
      game.running = !game.running;
      updateHud(game.running ? 'Running' : 'Paused');
    }
    return;
  }

  input.add(key);
});

window.addEventListener('keyup', (event) => {
  input.delete(event.key.toLowerCase());
});

resetGame();
requestAnimationFrame(frame);
