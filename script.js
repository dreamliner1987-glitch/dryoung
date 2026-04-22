// script.js - Simple 2D Airplane Shooting Game
// This version uses plain rectangle graphics so no external assets are required.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to full screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
let score = 0;
let gameOver = false;

// Player object
const player = {
  width: 50,
  height: 80,
  x: canvas.width / 2 - 25,
  y: canvas.height - 90,
  speed: 6,
  moving: { left: false, right: false, up: false, down: false },
};

const bullets = [];
const enemies = [];
let lastEnemySpawn = Date.now();
const enemySpawnInterval = 1500; // ms

// Input handling
document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'ArrowLeft':
      player.moving.left = true; break;
    case 'ArrowRight':
      player.moving.right = true; break;
    case 'ArrowUp':
      player.moving.up = true; break;
    case 'ArrowDown':
      player.moving.down = true; break;
    case 'Space':
      fireBullet(); break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'ArrowLeft':
      player.moving.left = false; break;
    case 'ArrowRight':
      player.moving.right = false; break;
    case 'ArrowUp':
      player.moving.up = false; break;
    case 'ArrowDown':
      player.moving.down = false; break;
  }
});

function fireBullet() {
  const bullet = {
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 10,
    speed: 8,
  };
  bullets.push(bullet);
}

function spawnEnemy() {
  const size = 50;
  const enemy = {
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: 2 + Math.random() * 2,
  };
  enemies.push(enemy);
}

function update() {
  if (gameOver) return;

  // Player movement
  if (player.moving.left) player.x -= player.speed;
  if (player.moving.right) player.x += player.speed;
  if (player.moving.up) player.y -= player.speed;
  if (player.moving.down) player.y += player.speed;

  // Keep player inside canvas
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y -= b.speed;
    if (b.y + b.height < 0) bullets.splice(i, 1);
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y += e.speed;
    if (e.y > canvas.height) {
      enemies.splice(i, 1);
      // optional: decrease score/life when enemy passes
    }
  }

  // Bullet‑enemy collision
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      if (
        b.x < e.x + e.width &&
        b.x + b.width > e.x &&
        b.y < e.y + e.height &&
        b.y + b.height > e.y
      ) {
        // hit detected
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
        document.getElementById('score').innerText = 'Score: ' + score;
        break;
      }
    }
  }

  // Player‑enemy collision (game over)
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (
      player.x < e.x + e.width &&
      player.x + player.width > e.x &&
      player.y < e.y + e.height &&
      player.y + player.height > e.y
    ) {
      gameOver = true;
      alert('게임 오버! 최종 점수: ' + score);
      if (confirm('다시 시작하시겠습니까?')) {
        resetGame();
      }
      return;
    }
  }

  // Enemy spawn timer
  if (Date.now() - lastEnemySpawn > enemySpawnInterval) {
    spawnEnemy();
    lastEnemySpawn = Date.now();
  }
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player (blue rectangle)
  ctx.fillStyle = '#4287f5';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw bullets (yellow)
  ctx.fillStyle = '#ffeb3b';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

  // Draw enemies (red rectangles)
  ctx.fillStyle = '#e53935';
  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

function resetGame() {
  score = 0;
  document.getElementById('score').innerText = 'Score: 0';
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 90;
  bullets.length = 0;
  enemies.length = 0;
  gameOver = false;
  lastEnemySpawn = Date.now();
  requestAnimationFrame(gameLoop);
}

// Start the game when page is ready
window.addEventListener('load', () => {
  document.getElementById('score').innerText = 'Score: 0';
  requestAnimationFrame(gameLoop);
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 캔버스 크기 설정 (전체 화면)
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 이미지 로드
const playerImg = new Image();
playerImg.src = 'assets/player_ship.png'; // 사용자에게 해당 파일을 assets 폴더에 복사하도록 안내
const enemyImg = new Image();
enemyImg.src = 'assets/enemy_ship.png';

// 게임 상태 변수
let score = 0;
let gameOver = false;

// 플레이어 객체
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 80,
  width: 50,
  height: 80,
  speed: 5,
  moving: { left: false, right: false, up: false, down: false },
};

// 총알 배열
const bullets = [];
// 적 배열
const enemies = [];

// 입력 처리
document.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'ArrowLeft':
      player.moving.left = true; break;
    case 'ArrowRight':
      player.moving.right = true; break;
    case 'ArrowUp':
      player.moving.up = true; break;
    case 'ArrowDown':
      player.moving.down = true; break;
    case 'Space':
      fireBullet(); break;
  }
});

document.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'ArrowLeft':
      player.moving.left = false; break;
    case 'ArrowRight':
      player.moving.right = false; break;
    case 'ArrowUp':
      player.moving.up = false; break;
    case 'ArrowDown':
      player.moving.down = false; break;
  }
});

function fireBullet() {
  const bullet = {
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 10,
    speed: 7,
  };
  bullets.push(bullet);
}

// 적 생성 타이머
let enemySpawnInterval = 2000; // 2초마다 적 생성
let lastEnemySpawn = Date.now();

function spawnEnemy() {
  const size = 50; // 적 비행기 크기
  const enemy = {
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: 2 + Math.random() * 2,
  };
  enemies.push(enemy);
}

function update() {
  if (gameOver) return;

  // 플레이어 이동
  if (player.moving.left) player.x -= player.speed;
  if (player.moving.right) player.x += player.speed;
  if (player.moving.up) player.y -= player.speed;
  if (player.moving.down) player.y += player.speed;
  // 화면 경계 제한
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

  // 총알 이동 및 화면 밖 제거
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y -= b.speed;
    if (b.y + b.height < 0) bullets.splice(i, 1);
  }

  // 적 이동 및 화면 밖 제거
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.y += e.speed;
    if (e.y > canvas.height) {
      enemies.splice(i, 1);
    }
  }

  // 충돌 검사 (총알 vs 적)
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      if (b.x < e.x + e.width && b.x + b.width > e.x &&
          b.y < e.y + e.height && b.y + b.height > e.y) {
        // 충돌 발생
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
        document.getElementById('score').innerText = 'Score: ' + score;
        break;
      }
    }
  }

  // 충돌 검사 (플레이어 vs 적)
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (player.x < e.x + e.width && player.x + player.width > e.x &&
        player.y < e.y + e.height && player.y + player.height > e.y) {
      // 게임 오버
      gameOver = true;
      alert('게임 오버! 최종 점수: ' + score);
      // 재시작 옵션 제공
      if (confirm('다시 시작하시겠습니까?')) {
        resetGame();
      }
      return;
    }
  }

  // 적 스폰 타이머 체크
  if (Date.now() - lastEnemySpawn > enemySpawnInterval) {
    spawnEnemy();
    lastEnemySpawn = Date.now();
  }
}

function draw() {
  // 배경은 CSS에서 설정했으니 투명 배경으로 클리어
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 플레이어 그리기
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  // 총알 그리기
  ctx.fillStyle = 'yellow';
  bullets.forEach(b => {
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  // 적 그리기
  enemies.forEach(e => {
    ctx.drawImage(enemyImg, e.x, e.y, e.width, e.height);
  });
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

function resetGame() {
  // 초기 상태 복구
  score = 0;
  document.getElementById('score').innerText = 'Score: 0';
  player.x = canvas.width / 2 - 25;
  player.y = canvas.height - 80;
  bullets.length = 0;
  enemies.length = 0;
  gameOver = false;
  lastEnemySpawn = Date.now();
  requestAnimationFrame(gameLoop);
}

// 게임 시작
window.onload = () => {
  // 캔버스 사이즈가 변하면 다시 설정
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.getElementById('score').innerText = 'Score: 0';
  requestAnimationFrame(gameLoop);
};
