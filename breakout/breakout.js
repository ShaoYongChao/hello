class BreakoutGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.animationId = null;
        
        // 游戏设置
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        
        // 游戏数据
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // 游戏对象
        this.paddle = null;
        this.balls = [];
        this.bricks = [];
        this.powerUps = [];
        this.particles = [];
        
        // 道具效果
        this.effects = {
            longPaddle: 0,
            shortPaddle: 0,
            fastBall: 0,
            slowBall: 0,
            fireBall: 0,
            magneticPaddle: 0
        };
        
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    initializeElements() {
        // 菜单元素
        this.gameMenu = document.getElementById('game-menu');
        this.startGameBtn = document.getElementById('start-game');
        this.showInstructionsBtn = document.getElementById('show-instructions');
        this.instructions = document.getElementById('instructions');
        this.closeInstructionsBtn = document.getElementById('close-instructions');
        
        // 游戏元素
        this.gameContainer = document.getElementById('game-container');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // UI元素
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.levelElement = document.getElementById('level');
        this.pauseBtn = document.getElementById('pause-game');
        
        // 游戏结束元素
        this.gameOverScreen = document.getElementById('game-over');
        this.gameOverTitle = document.getElementById('game-over-title');
        this.finalScore = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-game');
        this.backToMenuBtn = document.getElementById('back-to-menu');
    }
    
    setupEventListeners() {
        // 菜单事件
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.showInstructionsBtn.addEventListener('click', () => this.showInstructions());
        this.closeInstructionsBtn.addEventListener('click', () => this.hideInstructions());
        
        // 游戏控制事件
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.backToMenuBtn.addEventListener('click', () => this.backToMenu());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 鼠标事件
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.handleMouseClick(e));
        
        // 防止右键菜单
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    showInstructions() {
        this.instructions.classList.remove('hidden');
    }
    
    hideInstructions() {
        this.instructions.classList.add('hidden');
    }
    
    startGame() {
        this.gameMenu.classList.add('hidden');
        this.gameContainer.classList.remove('hidden');
        this.gameState = 'playing';
        this.initializeGame();
        this.gameLoop();
    }
    
    initializeGame() {
        // 重置游戏数据
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.updateUI();
        
        // 重置效果
        this.effects = {
            longPaddle: 0,
            shortPaddle: 0,
            fastBall: 0,
            slowBall: 0,
            fireBall: 0,
            magneticPaddle: 0
        };
        
        // 初始化游戏对象
        this.initializePaddle();
        this.initializeBalls();
        this.initializeBricks();
        this.powerUps = [];
        this.particles = [];
    }
    
    initializePaddle() {
        this.paddle = {
            x: this.canvasWidth / 2 - 60,
            y: this.canvasHeight - 30,
            width: 120,
            height: 15,
            speed: 8,
            originalWidth: 120
        };
    }
    
    initializeBalls() {
        this.balls = [{
            x: this.canvasWidth / 2,
            y: this.canvasHeight / 2,
            dx: 4,
            dy: -4,
            radius: 8,
            speed: 4,
            originalSpeed: 4,
            stuck: false,
            fireBall: false
        }];
    }
    
    initializeBricks() {
        this.bricks = [];
        const rows = 5 + this.level;
        const cols = 10;
        const brickWidth = 70;
        const brickHeight = 20;
        const padding = 5;
        const offsetTop = 60;
        const offsetLeft = (this.canvasWidth - (cols * (brickWidth + padding) - padding)) / 2;
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.bricks.push({
                    x: offsetLeft + col * (brickWidth + padding),
                    y: offsetTop + row * (brickHeight + padding),
                    width: brickWidth,
                    height: brickHeight,
                    color: colors[row % colors.length],
                    destroyed: false,
                    hits: Math.floor(row / 2) + 1
                });
            }
        }
    }
    
    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        
        if (e.key === ' ' && this.gameState === 'playing') {
            this.releaseStickyBalls();
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }
    
    handleMouseClick(e) {
        if (this.gameState === 'playing') {
            this.releaseStickyBalls();
        }
    }
    
    releaseStickyBalls() {
        this.balls.forEach(ball => {
            if (ball.stuck) {
                ball.stuck = false;
                ball.dy = -Math.abs(ball.dy);
            }
        });
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.pauseBtn.textContent = '▶️ 继续';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.pauseBtn.textContent = '⏸️ 暂停';
        }
    }
    
    restartGame() {
        this.gameOverScreen.classList.add('hidden');
        this.initializeGame();
        this.gameState = 'playing';
    }
    
    backToMenu() {
        this.gameContainer.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.gameMenu.classList.remove('hidden');
        this.gameState = 'menu';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.updateEffects();
        this.updatePaddle();
        this.updateBalls();
        this.updatePowerUps();
        this.updateParticles();
        this.checkCollisions();
        this.checkGameState();
    }
    
    updateEffects() {
        // 更新道具效果时间
        Object.keys(this.effects).forEach(effect => {
            if (this.effects[effect] > 0) {
                this.effects[effect]--;
                
                // 效果结束时恢复原状
                if (this.effects[effect] === 0) {
                    switch (effect) {
                        case 'longPaddle':
                        case 'shortPaddle':
                            this.paddle.width = this.paddle.originalWidth;
                            break;
                        case 'fastBall':
                        case 'slowBall':
                            this.balls.forEach(ball => {
                                const speed = ball.originalSpeed;
                                const magnitude = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                                ball.dx = (ball.dx / magnitude) * speed;
                                ball.dy = (ball.dy / magnitude) * speed;
                            });
                            break;
                        case 'fireBall':
                            this.balls.forEach(ball => ball.fireBall = false);
                            break;
                    }
                }
            }
        });
    }
    
    updatePaddle() {
        // 鼠标控制
        if (this.mouse.x > 0) {
            this.paddle.x = this.mouse.x - this.paddle.width / 2;
        }
        
        // 键盘控制
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.paddle.x += this.paddle.speed;
        }
        
        // 边界检测
        this.paddle.x = Math.max(0, Math.min(this.canvasWidth - this.paddle.width, this.paddle.x));
    }
    
    updateBalls() {
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            
            if (ball.stuck) {
                // 粘在挡板上的球跟随挡板移动
                ball.x = this.paddle.x + this.paddle.width / 2;
                ball.y = this.paddle.y - ball.radius;
                continue;
            }
            
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            // 墙壁碰撞
            if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= this.canvasWidth) {
                ball.dx = -ball.dx;
                this.createParticles(ball.x, ball.y, '#ffffff');
            }
            
            if (ball.y - ball.radius <= 0) {
                ball.dy = -ball.dy;
                this.createParticles(ball.x, ball.y, '#ffffff');
            }
            
            // 球掉落
            if (ball.y - ball.radius > this.canvasHeight) {
                this.balls.splice(i, 1);
                if (this.balls.length === 0) {
                    this.lives--;
                    this.updateUI();
                    if (this.lives > 0) {
                        this.initializeBalls();
                    }
                }
            }
        }
    }
    
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += powerUp.speed;
            
            // 移除超出屏幕的道具
            if (powerUp.y > this.canvasHeight) {
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // 检测与挡板的碰撞
            if (this.checkRectCollision(powerUp, this.paddle)) {
                this.applyPowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
                this.createParticles(powerUp.x, powerUp.y, powerUp.color);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        this.balls.forEach(ball => {
            if (ball.stuck) return;
            
            // 挡板碰撞
            if (this.checkBallPaddleCollision(ball, this.paddle)) {
                if (this.effects.magneticPaddle > 0) {
                    ball.stuck = true;
                } else {
                    const hitPos = (ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
                    ball.dx = hitPos * 5;
                    ball.dy = -Math.abs(ball.dy);
                }
                this.createParticles(ball.x, ball.y, '#ffffff');
            }
            
            // 砖块碰撞
            this.bricks.forEach(brick => {
                if (brick.destroyed) return;
                
                if (this.checkBallBrickCollision(ball, brick)) {
                    if (!ball.fireBall) {
                        // 普通球反弹
                        const ballCenterX = ball.x;
                        const ballCenterY = ball.y;
                        const brickCenterX = brick.x + brick.width / 2;
                        const brickCenterY = brick.y + brick.height / 2;
                        
                        const dx = ballCenterX - brickCenterX;
                        const dy = ballCenterY - brickCenterY;
                        
                        if (Math.abs(dx / brick.width) > Math.abs(dy / brick.height)) {
                            ball.dx = -ball.dx;
                        } else {
                            ball.dy = -ball.dy;
                        }
                    }
                    
                    // 砖块受损
                    brick.hits--;
                    if (brick.hits <= 0) {
                        brick.destroyed = true;
                        this.score += 10;
                        this.updateUI();
                        
                        // 随机掉落道具
                        if (Math.random() < 0.3) {
                            this.createPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
                        }
                    }
                    
                    this.createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
                }
            });
        });
    }
    
    checkBallPaddleCollision(ball, paddle) {
        return ball.x + ball.radius > paddle.x &&
               ball.x - ball.radius < paddle.x + paddle.width &&
               ball.y + ball.radius > paddle.y &&
               ball.y - ball.radius < paddle.y + paddle.height &&
               ball.dy > 0;
    }
    
    checkBallBrickCollision(ball, brick) {
        return ball.x + ball.radius > brick.x &&
               ball.x - ball.radius < brick.x + brick.width &&
               ball.y + ball.radius > brick.y &&
               ball.y - ball.radius < brick.y + brick.height;
    }
    
    checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createPowerUp(x, y) {
        const types = [
            { type: 'split', color: '#ff6b6b', symbol: '🔴' },
            { type: 'longPaddle', color: '#4ecdc4', symbol: '📏' },
            { type: 'shortPaddle', color: '#45b7d1', symbol: '📐' },
            { type: 'fastBall', color: '#feca57', symbol: '⚡' },
            { type: 'slowBall', color: '#96ceb4', symbol: '🐌' },
            { type: 'fireBall', color: '#ff9ff3', symbol: '🔥' },
            { type: 'magnetic', color: '#a8e6cf', symbol: '🎯' },
            { type: 'extraLife', color: '#ffd93d', symbol: '💎' }
        ];
        
        const powerUpType = types[Math.floor(Math.random() * types.length)];
        
        this.powerUps.push({
            x: x - 15,
            y: y,
            width: 30,
            height: 30,
            speed: 2,
            type: powerUpType.type,
            color: powerUpType.color,
            symbol: powerUpType.symbol
        });
    }
    
    applyPowerUp(type) {
        switch (type) {
            case 'split':
                this.splitBalls();
                break;
            case 'longPaddle':
                this.paddle.width = this.paddle.originalWidth * 1.5;
                this.effects.longPaddle = 600; // 10秒
                break;
            case 'shortPaddle':
                this.paddle.width = this.paddle.originalWidth * 0.7;
                this.effects.shortPaddle = 600;
                break;
            case 'fastBall':
                this.balls.forEach(ball => {
                    const magnitude = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                    const newSpeed = magnitude * 1.5;
                    ball.dx = (ball.dx / magnitude) * newSpeed;
                    ball.dy = (ball.dy / magnitude) * newSpeed;
                });
                this.effects.fastBall = 600;
                break;
            case 'slowBall':
                this.balls.forEach(ball => {
                    const magnitude = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                    const newSpeed = magnitude * 0.7;
                    ball.dx = (ball.dx / magnitude) * newSpeed;
                    ball.dy = (ball.dy / magnitude) * newSpeed;
                });
                this.effects.slowBall = 600;
                break;
            case 'fireBall':
                this.balls.forEach(ball => ball.fireBall = true);
                this.effects.fireBall = 600;
                break;
            case 'magnetic':
                this.effects.magneticPaddle = 600;
                break;
            case 'extraLife':
                this.lives++;
                this.updateUI();
                break;
        }
    }
    
    splitBalls() {
        const newBalls = [];
        this.balls.forEach(ball => {
            if (!ball.stuck) {
                // 创建两个新球
                const angle1 = Math.atan2(ball.dy, ball.dx) + Math.PI / 6;
                const angle2 = Math.atan2(ball.dy, ball.dx) - Math.PI / 6;
                const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                
                newBalls.push({
                    x: ball.x,
                    y: ball.y,
                    dx: Math.cos(angle1) * speed,
                    dy: Math.sin(angle1) * speed,
                    radius: ball.radius,
                    speed: ball.speed,
                    originalSpeed: ball.originalSpeed,
                    stuck: false,
                    fireBall: ball.fireBall
                });
                
                newBalls.push({
                    x: ball.x,
                    y: ball.y,
                    dx: Math.cos(angle2) * speed,
                    dy: Math.sin(angle2) * speed,
                    radius: ball.radius,
                    speed: ball.speed,
                    originalSpeed: ball.originalSpeed,
                    stuck: false,
                    fireBall: ball.fireBall
                });
            }
        });
        
        this.balls.push(...newBalls);
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 6,
                color: color,
                life: 30
            });
        }
    }
    
    checkGameState() {
        // 检查是否获胜
        const activeBricks = this.bricks.filter(brick => !brick.destroyed);
        if (activeBricks.length === 0) {
            this.level++;
            this.updateUI();
            this.initializeBricks();
            this.initializeBalls();
        }
        
        // 检查是否失败
        if (this.lives <= 0) {
            this.gameOver(false);
        }
    }
    
    gameOver(won) {
        this.gameState = 'gameOver';
        this.gameOverTitle.textContent = won ? '恭喜过关！' : '游戏结束';
        this.finalScore.textContent = `最终分数: ${this.score}`;
        this.gameOverScreen.classList.remove('hidden');
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.livesElement.textContent = this.lives;
        this.levelElement.textContent = this.level;
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        if (this.gameState === 'menu') return;
        
        // 绘制砖块
        this.bricks.forEach(brick => {
            if (!brick.destroyed) {
                this.ctx.fillStyle = brick.color;
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                
                // 绘制砖块边框
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
                
                // 显示剩余血量
                if (brick.hits > 1) {
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(brick.hits, brick.x + brick.width / 2, brick.y + brick.height / 2 + 4);
                }
            }
        });
        
        // 绘制挡板
        this.ctx.fillStyle = this.effects.magneticPaddle > 0 ? '#ff6b6b' : '#fff';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // 绘制球
        this.balls.forEach(ball => {
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = ball.fireBall ? '#ff6b6b' : '#fff';
            this.ctx.fill();
            
            // 火球效果
            if (ball.fireBall) {
                this.ctx.beginPath();
                this.ctx.arc(ball.x, ball.y, ball.radius + 3, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#ff9999';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
        
        // 绘制道具
        this.powerUps.forEach(powerUp => {
            this.ctx.fillStyle = powerUp.color;
            this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            
            // 绘制道具符号
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(powerUp.symbol, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 + 6);
        });
        
        // 绘制粒子效果
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            this.ctx.globalAlpha = 1;
        });
        
        // 绘制暂停提示
        if (this.gameState === 'paused') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏暂停', this.canvasWidth / 2, this.canvasHeight / 2);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        
        if (this.gameState !== 'menu') {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new BreakoutGame();
});