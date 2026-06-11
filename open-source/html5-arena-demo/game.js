const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const healthEl = document.getElementById("health");
const dashEl = document.getElementById("dash");

const keys = new Set();
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 16,
  speed: 230,
  health: 100,
  dashCooldown: 0,
};

let enemies = [];
let particles = [];
let score = 0;
let spawnTimer = 0;
let lastTime = performance.now();
let gameOver = false;

window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if (event.key === " " && player.dashCooldown <= 0 && !gameOver) {
    dash();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

function dash() {
  const direction = movementVector();
  player.x += direction.x * 95;
  player.y += direction.y * 95;
  clampPlayer();
  player.dashCooldown = 1.8;
  burst(player.x, player.y, "#66e3ff", 18);
}

function movementVector() {
  let x = 0;
  let y = 0;
  if (keys.has("w") || keys.has("arrowup")) y -= 1;
  if (keys.has("s") || keys.has("arrowdown")) y += 1;
  if (keys.has("a") || keys.has("arrowleft")) x -= 1;
  if (keys.has("d") || keys.has("arrowright")) x += 1;
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

function spawnEnemy() {
  const edge = Math.floor(Math.random() * 4);
  const position = [
    { x: -20, y: Math.random() * canvas.height },
    { x: canvas.width + 20, y: Math.random() * canvas.height },
    { x: Math.random() * canvas.width, y: -20 },
    { x: Math.random() * canvas.width, y: canvas.height + 20 },
  ][edge];

  enemies.push({
    x: position.x,
    y: position.y,
    radius: 14,
    speed: 80 + Math.random() * 55,
    damage: 12,
  });
}

function update(delta) {
  if (gameOver) {
    return;
  }

  const direction = movementVector();
  player.x += direction.x * player.speed * delta;
  player.y += direction.y * player.speed * delta;
  player.dashCooldown = Math.max(0, player.dashCooldown - delta);
  clampPlayer();

  spawnTimer -= delta;
  if (spawnTimer <= 0) {
    spawnEnemy();
    spawnTimer = Math.max(0.28, 1.1 - score / 900);
  }

  for (const enemy of enemies) {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemy.x += Math.cos(angle) * enemy.speed * delta;
    enemy.y += Math.sin(angle) * enemy.speed * delta;
  }

  enemies = enemies.filter((enemy) => {
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (distance < player.radius + enemy.radius) {
      player.health -= enemy.damage;
      burst(enemy.x, enemy.y, "#ff5f6d", 12);
      if (player.health <= 0) {
        player.health = 0;
        gameOver = true;
      }
      return false;
    }
    return true;
  });

  score += delta * 25;
  particles = particles.filter((particle) => {
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.life -= delta;
    return particle.life > 0;
  });
}

function clampPlayer() {
  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

function burst(x, y, color, amount) {
  for (let index = 0; index < amount; index++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 160;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: 0.35 + Math.random() * 0.3,
    });
  }
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  for (const particle of particles) {
    context.globalAlpha = Math.max(0, particle.life * 2);
    circle(particle.x, particle.y, 3, particle.color);
  }
  context.globalAlpha = 1;

  for (const enemy of enemies) {
    circle(enemy.x, enemy.y, enemy.radius, "#ff5f6d");
    circle(enemy.x - 4, enemy.y - 4, 3, "#ffe9ec");
  }

  circle(player.x, player.y, player.radius, "#66e3ff");
  circle(player.x + 5, player.y - 5, 5, "#e8fbff");

  if (gameOver) {
    context.fillStyle = "rgba(0, 0, 0, 0.58)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#eef4f8";
    context.font = "700 42px system-ui";
    context.textAlign = "center";
    context.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 12);
    context.font = "18px system-ui";
    context.fillText("Refresh to play again", canvas.width / 2, canvas.height / 2 + 28);
  }

  scoreEl.textContent = Math.floor(score).toString();
  healthEl.textContent = player.health.toString();
  dashEl.textContent = player.dashCooldown <= 0 ? "Ready" : `${player.dashCooldown.toFixed(1)}s`;
}

function drawGrid() {
  context.strokeStyle = "#18232d";
  context.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y < canvas.height; y += 48) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }
}

function circle(x, y, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function frame(now) {
  const delta = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(delta);
  draw();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
