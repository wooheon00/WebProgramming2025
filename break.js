const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverTitle = document.getElementById('gameOverTitle');
const finalScoreElement = document.getElementById('finalScore');

const marioImage = new Image();
marioImage.src = 'img/mario.png';

const luigiImage = new Image();
luigiImage.src = 'img/luigi.png';

const toadImage = new Image();
toadImage.src = 'img/toad.png';

const cloudImage = new Image();
cloudImage.src = 'img/cloud.png'; 

const cheepImage = new Image();
cheepImage.src = 'img/cheep.png'; 

const koongImage = new Image();
koongImage.src = 'img/koong.png';

const stage1Background = new Image();
stage1Background.src = 'img/stage1.jpeg';
    
const stage2Background = new Image();
stage2Background.src = 'img/stage2.jpeg';

const stage3Background = new Image();
stage3Background.src = 'img/stage3.jpeg';



let selectedLevel = null;
let selectedBallColor = null;
let selectedCharacter = null;


// 게임 설정
canvas.width = 800;
canvas.height = 600;

// 게임 상태
let gameState = 'start';
let score = 0;
let lives = 3;
let level = 1;
let ballLaunched = false;

// 패들 (캐릭터)
const paddle = {
    x: canvas.width / 2 - 50,
    y: canvas.height -60,
    width: 64,
    height: 30,
    speed: 8,
    powerUpTime: 0,
    originalWidth: 64,
};

// 공 (파이어볼)
const ball = {
    x: canvas.width / 2,
    y: paddle.y - 10,
    radius: 8,
    dx: 3,
    dy: -3,
    speed: 3.0 + 1.0 * level,
    starPower: 0,
    trail: [],
};

// 블록 설정
const blockRows = 6;
const blockCols = 10;
const blockWidth = 70;
const blockHeight = 25;
const blockPadding = 5;
const blockOffsetTop = 80;
const blockOffsetLeft = 35;

let blocks = [];
let powerUps = [];

let clouds = [];
let cheeps = [];
let koongs = [];

let particles = [];




// 키보드 입력
const keys = {};

// 구름 생성
function createClouds() {
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 200,
            width: 80 + Math.random() * 40,
            speed: 0.5 + Math.random() * 0.5,
        });
    }
}
// 칩 생성
function createCheeps() {
    for (let i = 0; i < 6; i++) {
        cheeps.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 400,
            width: 80 + Math.random() * 40,
            speed: 0.5 + Math.random() * 0.5,
        });
    }
}
// 쿵쿵이 생성
function createKoongs() {
    for (let i = 0; i < 3; i++) {
        koongs.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 300,
            width: 80 + Math.random() * 40,
            speed: 0.5 + Math.random() * 0.5,
        });
    }
}
// 모두 초기화
function backGroundArticleClear() {
    clouds = [];
    squids = [];
    koongs = [];
}


// 파티클 효과
function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            life: 20,
            color: color,
        });
    }
}

// 블록 생성
function createBlocks() {
    blocks = [];
    for (let r = 0; r < blockRows; r++) {
        blocks[r] = [];
        for (let c = 0; c < blockCols; c++) {
            let type = 'brick';
            let hits = 1;

            const rand = Math.random();
            if (level > 1 && rand < 0.1) {
                type = 'metal';
                hits = -1;
            } else if (rand < 0.15) {
                type = 'question';
            } else if (rand < 0.2) {
                type = 'coin';
            }

            blocks[r][c] = {
                x: c * (blockWidth + blockPadding) + blockOffsetLeft,
                y: r * (blockHeight + blockPadding) + blockOffsetTop,
                width: blockWidth,
                height: blockHeight,
                status: 1,
                type: type,
                hits: hits,
                animation: 0,
            };
        }
    }
}

// 파워업 생성
function createPowerUp(x, y) {
    const types = ['mushroom', 'fireFlower', 'star', 'coin'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.push({
        x: x,
        y: y,
        width: 30,
        height: 30,
        type: type,
        dy: 2,
        animation: 0,
    });
}

////////////////////////캐릭터 그리기///////////////////////////////
// 마리오 그리기
function drawMario() {
    const marioWidth = 64;
    const marioHeight = 64;

    // 마리오를 paddle 중앙에 정렬
    const marioX = paddle.x + paddle.width / 2 - marioWidth / 2;
    const marioY = paddle.y;

    // 바: 패들 위에, 마리오 중앙 위로
    const barWidth = paddle.width;
    const barHeight = 6;
    const barX = paddle.x;
    const barY = paddle.y - barHeight - 1;

    // 검은 바 그리기
    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 디버깅용 배경 (선택사항)
    ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
    ctx.fillRect(marioX, marioY, marioWidth, marioHeight);

    // 마리오 이미지 그리기
    ctx.drawImage(marioImage, marioX, marioY, marioWidth, marioHeight);
}

// 루이지 그리기
function drawLuigi() {
    const luigiWidth = 64;
    const luigiHeight = 64;

    // 마리오를 paddle 중앙에 정렬
    const luigiX = paddle.x + paddle.width / 2 - luigiWidth / 2;
    const luigiY = paddle.y;

    // 바: 패들 위에, 마리오 중앙 위로
    const barWidth = paddle.width;
    const barHeight = 6;
    const barX = paddle.x;
    const barY = paddle.y - barHeight - 1;

    // 검은 바 그리기
    ctx.fillStyle = 'green';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 디버깅용 배경 (선택사항)
    ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
    ctx.fillRect(luigiX, luigiY, luigiWidth, luigiHeight);

    // 마리오 이미지 그리기
    ctx.drawImage(luigiImage, luigiX, luigiY, luigiWidth, luigiHeight);
}
// 토드 그리기
function drawToad() {
    const toadWidth = 64;
    const toadHeight = 64;

    // 마리오를 paddle 중앙에 정렬
    const toadX = paddle.x + paddle.width / 2 - toadWidth / 2;
    const toadY = paddle.y;

    // 바: 패들 위에, 마리오 중앙 위로
    const barWidth = paddle.width;
    const barHeight = 6;
    const barX = paddle.x;
    const barY = paddle.y - barHeight - 1;

    // 검은 바 그리기
    ctx.fillStyle = 'white';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 디버깅용 배경 (선택사항)
    ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
    ctx.fillRect(toadX, toadY, toadWidth, toadHeight);

    // 마리오 이미지 그리기
    ctx.drawImage(toadImage, toadX, toadY, toadWidth, toadHeight);
}
///////////////////////////////////////////////////////////////////


// 파이어볼 그리기
function drawFireball() {
    // 트레일 효과
    ball.trail.push({ x: ball.x, y: ball.y, life: 10 });
    if (ball.trail.length > 8) ball.trail.shift();

    // 트레일 그리기
    ball.trail.forEach((trail, index) => {
        ctx.globalAlpha = trail.life / 20;
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, ball.radius * 0.7, 0, Math.PI * 2);

        // 트레일 색깔도 선택된 색에 따라 바꾸기 (예시)
        if (ball.starPower > 0) {
            ctx.fillStyle = '#FFD700'; // 별 파워 있을 때는 금색 고정
        } else {
            // 선택된 색상에 따른 트레일 색깔 맵
            const trailColors = {
                red: '#FF6600',
                green: '#00CC00',
                blue: '#0066FF',
            };
            ctx.fillStyle = trailColors[selectedBallColor] || '#FF6600';
        }

        ctx.fill();
        ctx.closePath();
        trail.life--;
    });
    ctx.globalAlpha = 1;

    // 메인 파이어볼
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);


    const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius);
    if (ball.starPower > 0) {
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
    } else {
        // 색상별 그라디언트 맵
        const gradients = {
            red: ['#FFFF00', '#FF6600', '#FF0000'],
            green: ['#AAFFAA', '#00CC00', '#007700'],
            blue: ['#AADFFF', '#0066FF', '#003399'],
        };
        const colors = gradients[selectedBallColor] || gradients.red;
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.5, colors[1]);
        gradient.addColorStop(1, colors[2]);
    }
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}

// 블록 그리기
function drawBlocks() {
    for (let r = 0; r < blockRows; r++) {
        for (let c = 0; c < blockCols; c++) {
            const block = blocks[r][c];
            if (block.status === 1) {
                const x = block.x;
                const y = block.y + Math.sin(block.animation) * 2;

                ctx.save();

                switch (block.type) {
                    case 'brick':
                        // 벽돌 패턴
                        ctx.fillStyle = '#C84C0C';
                        ctx.fillRect(x, y, blockWidth, blockHeight);
                        ctx.strokeStyle = '#8B0000';
                        ctx.lineWidth = 2;
                        // 벽돌 선
                        ctx.beginPath();
                        ctx.moveTo(x + blockWidth / 2, y);
                        ctx.lineTo(x + blockWidth / 2, y + blockHeight / 2);
                        ctx.moveTo(x, y + blockHeight / 2);
                        ctx.lineTo(x + blockWidth, y + blockHeight / 2);
                        ctx.stroke();
                        break;

                    case 'question':
                        // 물음표 블록
                        ctx.fillStyle = '#FDD835';
                        ctx.fillRect(x, y, blockWidth, blockHeight);
                        ctx.fillStyle = '#FFE082';
                        ctx.fillRect(x + 5, y + 5, blockWidth - 10, blockHeight - 10);
                        ctx.fillStyle = '#000';
                        ctx.font = 'bold 20px Press Start 2P';
                        ctx.textAlign = 'center';
                        ctx.fillText('?', x + blockWidth / 2, y + blockHeight / 2 + 8);
                        block.animation += 0.05;
                        break;

                    case 'coin':
                        // 코인 블록
                        ctx.fillStyle = '#8B4513';
                        ctx.fillRect(x, y, blockWidth, blockHeight);
                        // 코인
                        ctx.fillStyle = '#FFD700';
                        ctx.beginPath();
                        ctx.arc(x + blockWidth / 2, y + blockHeight / 2, 10, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#FFA500';
                        ctx.font = 'bold 14px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('$', x + blockWidth / 2, y + blockHeight / 2 + 5);
                        break;

                    case 'metal':
                        // 금속 블록
                        const metalGradient = ctx.createLinearGradient(x, y, x, y + blockHeight);
                        metalGradient.addColorStop(0, '#C0C0C0');
                        metalGradient.addColorStop(0.5, '#808080');
                        metalGradient.addColorStop(1, '#404040');
                        ctx.fillStyle = metalGradient;
                        ctx.fillRect(x, y, blockWidth, blockHeight);
                        // 리벳
                        ctx.fillStyle = '#606060';
                        ctx.beginPath();
                        ctx.arc(x + 10, y + 10, 3, 0, Math.PI * 2);
                        ctx.arc(x + blockWidth - 10, y + 10, 3, 0, Math.PI * 2);
                        ctx.arc(x + 10, y + blockHeight - 10, 3, 0, Math.PI * 2);
                        ctx.arc(x + blockWidth - 10, y + blockHeight - 10, 3, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                }

                // 블록 테두리
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, blockWidth, blockHeight);

                ctx.restore();
            }
        }
    }
}

// 파워업 그리기
function drawPowerUps() {
    powerUps.forEach((powerUp) => {
        powerUp.animation += 0.1;
        const bounce = Math.sin(powerUp.animation) * 3;

        switch (powerUp.type) {
            case 'mushroom':
                // 슈퍼 버섯
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(powerUp.x + 5, powerUp.y + bounce, 20, 15);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(powerUp.x + 5, powerUp.y + 15 + bounce, 20, 10);
                // 점
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(powerUp.x + 8, powerUp.y + 3 + bounce, 4, 4);
                ctx.fillRect(powerUp.x + 18, powerUp.y + 3 + bounce, 4, 4);
                ctx.fillRect(powerUp.x + 13, powerUp.y + 8 + bounce, 4, 4);
                break;

            case 'fireFlower':
                // 파이어 플라워
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(powerUp.x + 13, powerUp.y + 20 + bounce, 4, 8);
                // 꽃잎
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 72 * Math.PI) / 180;
                    const petalX = powerUp.x + 15 + Math.cos(angle) * 10;
                    const petalY = powerUp.y + 10 + bounce + Math.sin(angle) * 10;
                    ctx.arc(petalX, petalY, 6, 0, Math.PI * 2);
                }
                ctx.fill();
                // 중앙
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(powerUp.x + 15, powerUp.y + 10 + bounce, 5, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'star':
                // 무적 스타
                ctx.fillStyle = '#FFD700';
                drawStar(powerUp.x + 15, powerUp.y + 15 + bounce, 5, 12, 6);
                // 반짝임
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(powerUp.x + 12, powerUp.y + 12 + bounce, 2, 2);
                ctx.fillRect(powerUp.x + 16, powerUp.y + 16 + bounce, 2, 2);
                break;

            case 'coin':
                // 코인
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(powerUp.x + 15, powerUp.y + 15 + bounce, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#FFA500';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = '#000';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('$', powerUp.x + 15, powerUp.y + 20 + bounce);
                break;
        }
    });
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

// 구름 그리기
function drawClouds() {
    clouds.forEach((cloud) => {
        ctx.drawImage(
            cloudImage,
            cloud.x - 25,  // 50 / 2
            cloud.y - 25,
            100,
            40
        );
    });
}
// 칩 그리기
function drawCheeps() {
    cheeps.forEach((cheep) => {
        ctx.drawImage(
            cheepImage,
            cheep.x - 25,  // 50 / 2
            cheep.y - 25,
            100,
            100
        );
    });
}
// 쿵쿵이 그리기
function drawKoongs() {
        koongs.forEach((koong) => {
        ctx.drawImage(
            koongImage,
            koong.x - 25,  // 50 / 2
            koong.y - 25,
            120,
            100
        );
    });
}


// 파티클 그리기
function drawParticles() {
    particles = particles.filter((particle) => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life--;

        if (particle.life > 0) {
            ctx.globalAlpha = particle.life / 20;
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, 4, 4);
            ctx.globalAlpha = 1;
            return true;
        }
        return false;
    });
}

// UI 그리기
function drawUI() {
    // 상단 바
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, 50);

    // 텍스트 스타일
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Press Start 2P';
    ctx.textAlign = 'left';

    // 점수
    ctx.fillText(`SCORE`, 20, 20);
    ctx.fillText(`${score}`, 20, 40);

    // 코인 아이콘
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(200, 25, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('$', 200, 29);

    // 생명 (마리오 아이콘)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFF';
    ctx.font = '16px Press Start 2P';
    ctx.fillText('x' + lives, 220, 30);

    // 레벨
    ctx.fillText(`WORLD`, canvas.width - 150, 20);
    ctx.fillText(`1-${level}`, canvas.width - 150, 40);

    // 레벨 클리어 메시지
    if (gameState === 'levelClear') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = '32px Press Start 2P';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL CLEAR!', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Press Start 2P';
        ctx.fillText('PRESS SPACE', canvas.width / 2, canvas.height / 2 + 50);
    }
}

// 충돌 감지
function ballPaddleCollision() {
    if (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height
    ) {
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = 6 * (hitPos - 0.5);
        ball.dy = -Math.abs(ball.dy);

        // 효과음 대신 시각 효과
        createParticles(ball.x, ball.y, '#FFFF00');
    }
}

function ballBlockCollision() {
    for (let r = 0; r < blockRows; r++) {
        for (let c = 0; c < blockCols; c++) {
            const block = blocks[r][c];
            if (block.status === 1) {
                if (
                    ball.x > block.x &&
                    ball.x < block.x + block.width &&
                    ball.y > block.y &&
                    ball.y < block.y + block.height
                ) {
                    ball.dy = -ball.dy;

                    if (block.type !== 'metal' || ball.starPower > 0) {
                        block.status = 0;

                        // 파티클 효과
                        let particleColor = '#C84C0C';

                        switch (block.type) {
                            case 'brick':
                                score += 10;
                                particleColor = '#C84C0C';
                                break;
                            case 'question':
                                score += 20;
                                createPowerUp(block.x + block.width / 2 - 15, block.y);
                                particleColor = '#FDD835';
                                break;
                            case 'coin':
                                score += 50;
                                particleColor = '#FFD700';
                                break;
                            case 'metal':
                                if (ball.starPower > 0) {
                                    score += 100;
                                    particleColor = '#C0C0C0';
                                }
                                break;
                        }

                        createParticles(
                            block.x + block.width / 2,
                            block.y + block.height / 2,
                            particleColor,
                        );
                    }
                }
            }
        }
    }
}

function paddlePowerUpCollision() {
    powerUps = powerUps.filter((powerUp) => {
        if (
            powerUp.x + powerUp.width > paddle.x &&
            powerUp.x < paddle.x + paddle.width &&
            powerUp.y + powerUp.height > paddle.y &&
            powerUp.y < paddle.y + paddle.height
        ) {
            switch (powerUp.type) {
                case 'mushroom':
                    paddle.width = paddle.originalWidth * 1.5;
                    paddle.powerUpTime = 360;
                    break;
                case 'fireFlower':
                    score += 200;
                    break;
                case 'star':
                    ball.starPower = 360;
                    break;
                case 'coin':
                    lives++;
                    break;
            }

            createParticles(powerUp.x + 15, powerUp.y + 15, '#FFD700');
            return false;
        }
        return true;
    });
}

// 게임 업데이트
function update() {
    if (gameState !== 'playing') return;

    // 패들 이동
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        paddle.x = Math.max(0, paddle.x - paddle.speed);
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        paddle.x = Math.min(canvas.width - paddle.width, paddle.x + paddle.speed);
    }

    // 공 발사
    if (!ballLaunched) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius - 6;
        if (keys[' ']) {
            ballLaunched = true;
            ball.dx = ball.speed;
            ball.dy = -ball.speed;
        }
    } else {
        // 공 이동
        ball.x += ball.dx;
        ball.y += ball.dy;

        // 벽 충돌
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
            ball.dx = -ball.dx;
            createParticles(ball.x, ball.y, '#FFFFFF');
        }
        if (ball.y - ball.radius < 50) {
            ball.dy = -ball.dy;
            createParticles(ball.x, ball.y, '#FFFFFF');
        }

        // 바닥 충돌
        if (ball.y + ball.radius > canvas.height) {
            lives--;
            ballLaunched = false;
            ball.dx = ball.speed;
            ball.dy = ball.speed;
            ball.trail = [];

            if (lives <= 0) {
                gameState = 'gameOver';
                finalScoreElement.textContent = score;
                gameOverTitle.textContent = 'GAME OVER!';
                gameOverScreen.classList.remove('hidden');
            }
        }

        // 충돌 검사
        ballPaddleCollision();
        ballBlockCollision();
    }

    // 파워업 이동 및 충돌
    powerUps.forEach((powerUp) => {
        powerUp.y += powerUp.dy;
    });
    powerUps = powerUps.filter((powerUp) => powerUp.y < canvas.height);
    paddlePowerUpCollision();

    // 파워업 시간 감소
    if (paddle.powerUpTime > 0) {
        paddle.powerUpTime--;
        if (paddle.powerUpTime === 0) {
            paddle.width = paddle.originalWidth;
        }
    }

    if (ball.starPower > 0) {
        ball.starPower--;
    }

    // 구름 이동
    clouds.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + 100) {
            cloud.x = -100;
            cloud.y = Math.random() * 200;
        }
    });

    // 칩 이동
    cheeps.forEach((cheep) => {
        cheep.x -= cheep.speed;
        if (cheep.x < -100) {
            cheep.x = canvas.width + 100;
            cheep.y = Math.random() * 200;
        }
    });

    // 쿵쿵이 이동
    koongs.forEach((koong) => {
        koong.x += koong.speed;
        if (koong.x > canvas.width + 100) {
            koong.x = -100;
            koong.y = Math.random() * 200;
        }
    });

    // 레벨 클리어 체크
    let blocksRemaining = 0;
    for (let r = 0; r < blockRows; r++) {
        for (let c = 0; c < blockCols; c++) {
            if (blocks[r][c].status === 1 && blocks[r][c].type !== 'metal') {
                blocksRemaining++;
            }
        }
    }

    if (blocksRemaining === 0) {
        if (level >= 3) {
            gameState = 'gameOver';
            finalScoreElement.textContent = score;
            gameOverTitle.textContent = 'YOU WIN!';
            gameOverScreen.classList.remove('hidden');
        } else {
            gameState = 'levelClear';
        }
    }
}

// 게임 그리기
function draw() {

    // 배경
    if (level === 1) {
        ctx.drawImage(stage1Background, 0, 0, canvas.width, canvas.height);
    } else if (level === 2) {
        ctx.drawImage(stage2Background, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.drawImage(stage3Background, 0, 0, canvas.width, canvas.height);
    }




    if (level == 1) {
        drawClouds();
    } else if (level == 2) {
        drawCheeps();
    } else {
        drawKoongs();
    }

    // 게임 요소들
    drawBlocks();
    drawPowerUps();

    if (selectedCharacter === "mario") {
        drawMario();
    } else if (selectedCharacter === "luigi") {
        drawLuigi();
    } else if (selectedCharacter === "toad") {
        drawToad();
    }

    drawFireball();
    drawParticles();
    drawUI();
}

// 게임 루프
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 게임 초기화
function init() {
    createBlocks();

    createClouds();
    createKoongs();
    createCheeps();

    gameLoop();
}


// 게임 리셋
function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    ballLaunched = false;
    gameState = 'playing';
    paddle.x = canvas.width / 2 - 50;
    paddle.width = paddle.originalWidth;
    paddle.powerUpTime = 0;
    ball.x = canvas.width / 2;
    ball.y = paddle.y - 15;
    ball.dx = 3;
    ball.dy = -3;
    ball.starPower = 0;
    ball.trail = [];
    powerUps = [];
    particles = [];
    createBlocks();
    gameOverScreen.classList.add('hidden');
 

    gameState = 'start';
    startScreen.classList.remove('hidden');

}

// 다음 레벨
function nextLevel() {
    level++;
    ballLaunched = false;
    ball.x = canvas.width / 2;
    ball.y = paddle.y - 15;
    ball.dx = 3.0 + 1.0 * level;;
    ball.dy = -(3.0 + 1.0 * level);
    ball.speed = 3.0 + 1.0 * level;
    ball.trail = [];
    powerUps = [];
    particles = [];
    createBlocks();
    gameState = 'playing';
}

// 이벤트 리스너
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (gameState === 'start' && e.key === ' ') {

        selectedLevel = parseInt(document.getElementById("levelSelect").value);
        selectedBallColor = document.getElementById("ballColor").value;
        selectedCharacter = document.getElementById("characterSelect").value;
        level = selectedLevel;

        ball.speed = 3.0 + 0.6 * level;
        createBlocks();

        gameState = 'playing';
        startScreen.classList.add('hidden');
    } else if (gameState === 'levelClear' && e.key === ' ') {
        nextLevel();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 마우스 컨트롤
canvas.addEventListener('mousemove', (e) => {
    if (gameState === 'playing') {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        paddle.x = mouseX - paddle.width / 2;
        paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));
    }
});

canvas.addEventListener('click', () => {
    if (gameState === 'playing' && !ballLaunched) {
        ballLaunched = true;
        ball.dx = ball.speed;
        ball.dy = -ball.speed;
    }
});


//인트로
const intro = document.getElementById('introOverlay');
  const skipBtn = document.getElementById('skipButton');
  const introGif = document.getElementById('introGif');
  const startMessage = document.getElementById('startMessage');

  let gifTimer;

  // 1. 10초 후 GIF를 숨기고 문구 보여줌
  gifTimer = setTimeout(() => {
    introGif.style.display = 'none';
    startMessage.style.display = 'block';
  }, 10000);

  // 2. Skip 버튼을 누르면 모든 intro 요소 제거
  skipBtn.addEventListener('click', () => {
    clearTimeout(gifTimer); // gif 타이머 취소
    intro.style.display = 'none'; // 전체 인트로 숨김
  });

window.onload = function () {
      
    init();  // 이미지, 캔버스 등 페이지 로드 완료 후 게임 시작

};