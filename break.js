const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverTitle = document.getElementById('gameOverTitle');
const finalScoreElement = document.getElementById('finalScore');


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
    y: canvas.height - 40,
    width: 100,
    height: 30,
    speed: 8,
    powerUpTime: 0,
    originalWidth: 100,
};

// 공 (파이어볼)
const ball = {
    x: canvas.width / 2,
    y: paddle.y - 15,
    radius: 8,
    dx: 3,
    dy: -3,
    speed: 3,
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
let squids = [];
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
// 징오징오 생성
function createSquids(count = 3) {
    for (let i = 0; i < count; i++) {
        squids.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height / 2,
            size: 30,
            speedY: 1 + Math.random() * 0.5,
        });
    }
}
// 쿵쿵이 생성
function createKoongs(count = 2) {
    for (let i = 0; i < count; i++) {
        koongs.push({
            x: Math.random() * canvas.width,
            y: canvas.height - 50,
            size: 40,
            speedX: 1 + Math.random(),
            direction: Math.random() < 0.5 ? 1 : -1, // 좌우 랜덤 방향
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
            } else if (rand < 0.25) {
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
    const x = paddle.x;
    const y = paddle.y;

    // 몸통 (빨간색)
    ctx.fillStyle = '#E52521';
    ctx.fillRect(x + 35, y + 10, 30, 15);

    // 바지 (파란색)
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(x + 35, y + 20, 30, 10);

    // 얼굴
    ctx.fillStyle = '#FDB8A0';
    ctx.fillRect(x + 40, y, 20, 15);

    // 모자
    ctx.fillStyle = '#E52521';
    ctx.fillRect(x + 35, y - 5, 30, 10);

    // 수염
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 42, y + 8, 16, 2);

    // 눈
    ctx.fillRect(x + 44, y + 4, 3, 3);
    ctx.fillRect(x + 53, y + 4, 3, 3);

    // 팔
    ctx.fillStyle = '#FDB8A0';
    ctx.fillRect(x + 30, y + 12, 5, 8);
    ctx.fillRect(x + 65, y + 12, 5, 8);

    // 장갑
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 28, y + 18, 7, 7);
    ctx.fillRect(x + 65, y + 18, 7, 7);

    // 신발
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 33, y + 25, 15, 5);
    ctx.fillRect(x + 52, y + 25, 15, 5);
}
// 루이지 그리기
function drawLuigi() {
    const x = paddle.x;
    const y = paddle.y;

    // 몸통 (초록색)
    ctx.fillStyle = '#00A86B';
    ctx.fillRect(x + 35, y + 5, 30, 20);

    // 바지 (파란색)
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(x + 35, y + 20, 30, 10);

    // 얼굴
    ctx.fillStyle = '#FDB8A0';
    ctx.fillRect(x + 40, y - 5, 20, 15);

    // 모자
    ctx.fillStyle = '#00A86B';
    ctx.fillRect(x + 35, y - 10, 30, 8);

    // 수염
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 42, y + 2, 16, 2);

    // 눈
    ctx.fillRect(x + 44, y - 2, 3, 3);
    ctx.fillRect(x + 53, y - 2, 3, 3);

    // 팔
    ctx.fillStyle = '#FDB8A0';
    ctx.fillRect(x + 30, y + 10, 5, 10);
    ctx.fillRect(x + 65, y + 10, 5, 10);

    // 장갑
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 28, y + 18, 7, 7);
    ctx.fillRect(x + 65, y + 18, 7, 7);

    // 신발
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 33, y + 28, 15, 5);
    ctx.fillRect(x + 52, y + 28, 15, 5);
}
// 토드 그리기
function drawToad() {
    const x = paddle.x;
    const y = paddle.y;

    // 몸통 (파란 조끼 + 베이지색 바지)
    ctx.fillStyle = '#1E90FF'; // 조끼
    ctx.fillRect(x + 37, y + 15, 26, 10);

    ctx.fillStyle = '#F5DEB3'; // 바지
    ctx.fillRect(x + 37, y + 25, 26, 10);

    // 얼굴
    ctx.fillStyle = '#FFF5E1';
    ctx.fillRect(x + 40, y, 20, 15);

    // 모자 (버섯 머리)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + 50, y - 5, 15, 0, Math.PI * 2);
    ctx.fill();

    // 빨간 점들 (버섯 무늬)
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(x + 50, y - 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 40, y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 60, y - 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // 눈
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 45, y + 4, 2, 5);
    ctx.fillRect(x + 53, y + 4, 2, 5);

    // 팔
    ctx.fillStyle = '#FFF5E1';
    ctx.fillRect(x + 30, y + 17, 5, 10);
    ctx.fillRect(x + 65, y + 17, 5, 10);

    // 신발
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 35, y + 33, 12, 5);
    ctx.fillRect(x + 53, y + 33, 12, 5);
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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach((cloud) => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
        ctx.arc(cloud.x + 25, cloud.y, 25, 0, Math.PI * 2);
        ctx.arc(cloud.x + 50, cloud.y, 20, 0, Math.PI * 2);
        ctx.arc(cloud.x + 15, cloud.y - 10, 15, 0, Math.PI * 2);
        ctx.arc(cloud.x + 35, cloud.y - 10, 20, 0, Math.PI * 2);
        ctx.fill();
    });
}
// 징오징오 그리기
function drawSquids() {
    squids.forEach((squid) => {
        // 움직임
        squid.y += squid.speedY;
        if (squid.y > canvas.height) squid.y = -squid.size;

        // 징오징오 그리기 (단순화된 모습)
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(squid.x, squid.y, squid.size / 2, 0, Math.PI * 2); // 머리
        ctx.fill();
        ctx.closePath();

        // 다리 (아래에 선 몇 개)
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(squid.x + i * 5, squid.y + squid.size / 2);
            ctx.lineTo(squid.x + i * 5, squid.y + squid.size);
            ctx.stroke();
        }
    });
}
// 쿵쿵이 그리기
function drawKoongs() {
    koongs.forEach((koong) => {
        // 움직임
        koong.x += koong.speedX * koong.direction;
        if (koong.x < 0 || koong.x > canvas.width - koong.size) koong.direction *= -1;

        // 쿵쿵이 그리기 (단순한 네모 몸체 + 눈)
        ctx.fillStyle = 'brown';
        ctx.fillRect(koong.x, koong.y - koong.size, koong.size, koong.size);

        // 눈 그리기
        ctx.fillStyle = 'white';
        ctx.fillRect(koong.x + 5, koong.y - koong.size + 10, 10, 10);
        ctx.fillRect(koong.x + koong.size - 15, koong.y - koong.size + 10, 10, 10);

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(koong.x + 10, koong.y - koong.size + 15, 3, 0, Math.PI * 2);
        ctx.arc(koong.x + koong.size - 10, koong.y - koong.size + 15, 3, 0, Math.PI * 2);
        ctx.fill();
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
                    ball.speed = 5;
                    setTimeout(() => {
                        ball.speed = 3 + level * 0.3;
                    }, 5000);
                    break;
                case 'star':
                    ball.starPower = 360;
                    break;
                case 'coin':
                    score += 100;
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
        ball.y = paddle.y - ball.radius - 1;
        if (keys[' ']) {
            ballLaunched = true;
            ball.dx = 3;
            ball.dy = -3;
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
            ball.dx = 3;
            ball.dy = -3;
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
    if (level == 1) {
        ctx.fillStyle = '#5C94FC';
    } else if (level == 2) {
        ctx.fillStyle = '#0000ff';
    } else {
        ctx.fillStyle = '#ff0000';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);




    if (level == 1) {
        drawClouds();
    } else if (level == 2) {
        drawSquids();
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
    createSquids();

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
    ball.dx = 3 + level * 0.3;
    ball.dy = -(3 + level * 0.3);
    ball.speed = 3 + level * 0.3;
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
        ball.dx = 3;
        ball.dy = -3;
    }
});

// 게임 시작
init();