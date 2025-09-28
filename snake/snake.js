class SnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.animationId = null;
        
        // 游戏设置
        this.gridSize = 20;
        this.canvasSize = 600;
        this.gridCount = this.canvasSize / this.gridSize;
        
        // 游戏配置
        this.gameSpeed = 100; // 毫秒
        this.gameMode = 'classic'; // classic, border
        
        // 游戏数据
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.snake = [];
        this.food = {};
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // 控制
        this.keys = {};
        this.lastMoveTime = 0;
        
        // 触摸控制
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 30; // 最小滑动距离
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupResponsiveCanvas();
        this.updateHighScoreDisplay();
    }
    
    initializeElements() {
        // 菜单元素
        this.gameMenu = document.getElementById('game-menu');
        this.startBtn = document.getElementById('start-game');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.modeBtns = document.querySelectorAll('.mode-btn');
        
        // 游戏元素
        this.gameContainer = document.getElementById('game-container');
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // UI元素
        this.scoreElement = document.getElementById('score');
        this.lengthElement = document.getElementById('length');
        this.highScoreElement = document.getElementById('high-score');
        this.pauseBtn = document.getElementById('pause-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.menuBtn = document.getElementById('menu-btn');
        
        // 游戏结束元素
        this.gameOverScreen = document.getElementById('game-over');
        this.gameOverTitle = document.getElementById('game-over-title');
        this.finalScore = document.getElementById('final-score');
        this.finalLength = document.getElementById('final-length');
        this.newRecord = document.getElementById('new-record');
        this.playAgainBtn = document.getElementById('play-again');
        this.backMenuBtn = document.getElementById('back-menu');
        
        // 移动端控制
        this.directionBtns = document.querySelectorAll('.direction-btn');
    }
    
    setupEventListeners() {
        // 菜单事件
        this.startBtn.addEventListener('click', () => this.startGame());
        
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDifficulty(e));
        });
        
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectMode(e));
        });
        
        // 游戏控制事件
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.menuBtn.addEventListener('click', () => this.backToMenu());
        
        // 游戏结束事件
        this.playAgainBtn.addEventListener('click', () => this.restartGame());
        this.backMenuBtn.addEventListener('click', () => this.backToMenu());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 移动端控制
        this.directionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDirectionClick(e));
        });
        
        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // 防止触摸默认行为
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
        this.canvas.addEventListener('touchend', (e) => e.preventDefault());
        
        // 防止方向键滚动页面
        window.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        // 窗口大小变化事件
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 100);
        });
    }
    
    selectDifficulty(e) {
        this.difficultyBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.gameSpeed = parseInt(e.target.dataset.speed);
    }
    
    selectMode(e) {
        this.modeBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.gameMode = e.target.dataset.mode;
    }
    
    startGame() {
        this.gameMenu.classList.add('hidden');
        this.gameContainer.classList.remove('hidden');
        this.gameState = 'playing';
        this.initializeGame();
        this.handleResize(); // 确保画布大小正确
        this.gameLoop();
    }
    
    initializeGame() {
        // 重置游戏数据
        this.score = 0;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.lastMoveTime = 0;
        
        // 初始化蛇
        this.snake = [
            { x: Math.floor(this.gridCount / 2), y: Math.floor(this.gridCount / 2) }
        ];
        
        // 生成食物
        this.generateFood();
        
        // 更新UI
        this.updateUI();
        this.pauseBtn.textContent = '⏸️ 暂停';
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.gridCount),
                y: Math.floor(Math.random() * this.gridCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }
    
    handleKeyDown(e) {
        if (this.gameState !== 'playing') return;
        
        const key = e.key.toLowerCase();
        
        switch (key) {
            case 'arrowup':
            case 'w':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'arrowdown':
            case 's':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'arrowleft':
            case 'a':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'arrowright':
            case 'd':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
            case ' ':
                this.togglePause();
                break;
        }
    }
    
    handleDirectionClick(e) {
        if (this.gameState !== 'playing') return;
        
        const direction = e.target.dataset.direction;
        
        switch (direction) {
            case 'up':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'down':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'left':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'right':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        if (this.gameState !== 'playing') return;
        
        const touch = e.changedTouches[0];
        this.touchEndX = touch.clientX;
        this.touchEndY = touch.clientY;
        
        this.handleSwipe();
    }
    
    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // 计算滑动距离
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 如果滑动距离太小，忽略
        if (distance < this.minSwipeDistance) return;
        
        // 判断滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > 0 && this.direction.x === 0) {
                // 向右滑动
                this.nextDirection = { x: 1, y: 0 };
            } else if (deltaX < 0 && this.direction.x === 0) {
                // 向左滑动
                this.nextDirection = { x: -1, y: 0 };
            }
        } else {
            // 垂直滑动
            if (deltaY > 0 && this.direction.y === 0) {
                // 向下滑动
                this.nextDirection = { x: 0, y: 1 };
            } else if (deltaY < 0 && this.direction.y === 0) {
                // 向上滑动
                this.nextDirection = { x: 0, y: -1 };
            }
        }
    }
    
    setupResponsiveCanvas() {
        this.handleResize();
    }
    
    handleResize() {
        const container = this.gameContainer;
        if (!container || container.classList.contains('hidden')) return;
        
        // 获取可用空间
        const maxWidth = Math.min(window.innerWidth - 40, 600);
        const maxHeight = Math.min(window.innerHeight - 200, 600);
        
        // 保持正方形比例
        const size = Math.min(maxWidth, maxHeight);
        
        // 应用新尺寸
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        
        // 存储缩放比例
        this.canvasScale = size / this.canvasSize;
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
    
    update(currentTime) {
        if (this.gameState !== 'playing') return;
        
        if (currentTime - this.lastMoveTime >= this.gameSpeed) {
            this.moveSnake();
            this.checkCollisions();
            this.checkFood();
            this.lastMoveTime = currentTime;
        }
    }
    
    moveSnake() {
        // 更新方向
        this.direction = { ...this.nextDirection };
        
        // 计算新的头部位置
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 处理边界
        if (this.gameMode === 'border') {
            // 穿墙模式
            if (head.x < 0) head.x = this.gridCount - 1;
            if (head.x >= this.gridCount) head.x = 0;
            if (head.y < 0) head.y = this.gridCount - 1;
            if (head.y >= this.gridCount) head.y = 0;
        }
        
        // 添加新头部
        this.snake.unshift(head);
        
        // 如果没有吃到食物，移除尾部
        if (head.x !== this.food.x || head.y !== this.food.y) {
            this.snake.pop();
        }
    }
    
    checkCollisions() {
        const head = this.snake[0];
        
        // 检查墙壁碰撞（经典模式）
        if (this.gameMode === 'classic') {
            if (head.x < 0 || head.x >= this.gridCount || 
                head.y < 0 || head.y >= this.gridCount) {
                this.gameOver();
                return;
            }
        }
        
        // 检查自身碰撞
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }
    }
    
    checkFood() {
        const head = this.snake[0];
        
        if (head.x === this.food.x && head.y === this.food.y) {
            // 吃到食物
            this.score += 10;
            this.generateFood();
            this.updateUI();
            
            // 添加尾部（因为在moveSnake中没有移除）
            // 实际上已经在moveSnake中处理了
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // 检查是否创造新纪录
        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            this.saveHighScore();
            this.updateHighScoreDisplay();
            this.newRecord.classList.remove('hidden');
        } else {
            this.newRecord.classList.add('hidden');
        }
        
        // 显示游戏结束界面
        this.finalScore.textContent = this.score;
        this.finalLength.textContent = this.snake.length;
        this.gameOverScreen.classList.remove('hidden');
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.lengthElement.textContent = this.snake.length;
    }
    
    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    loadHighScore() {
        return parseInt(localStorage.getItem('snakeHighScore') || '0');
    }
    
    saveHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore.toString());
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        if (this.gameState === 'menu') return;
        
        // 绘制网格（可选）
        this.drawGrid();
        
        // 绘制食物
        this.drawFood();
        
        // 绘制蛇
        this.drawSnake();
        
        // 绘制暂停提示
        if (this.gameState === 'paused') {
            this.drawPauseOverlay();
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.gridCount; i++) {
            const pos = i * this.gridSize;
            
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvasSize);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvasSize, pos);
            this.ctx.stroke();
        }
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // 绘制食物（红色圆形）
        this.ctx.fillStyle = '#ff4444';
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize / 2,
            y + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // 添加高光效果
        this.ctx.fillStyle = '#ff8888';
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize / 2 - 3,
            y + this.gridSize / 2 - 3,
            this.gridSize / 4,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // 绘制蛇头
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
                
                // 绘制眼睛
                this.ctx.fillStyle = '#fff';
                const eyeSize = 3;
                const eyeOffset = 5;
                
                if (this.direction.x === 1) { // 向右
                    this.ctx.fillRect(x + this.gridSize - eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - eyeOffset, y + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.direction.x === -1) { // 向左
                    this.ctx.fillRect(x + eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + eyeOffset - eyeSize, y + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.direction.y === -1) { // 向上
                    this.ctx.fillRect(x + eyeOffset, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                } else if (this.direction.y === 1) { // 向下
                    this.ctx.fillRect(x + eyeOffset, y + this.gridSize - eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + this.gridSize - eyeOffset, eyeSize, eyeSize);
                }
            } else {
                // 绘制蛇身
                const alpha = 1 - (index / this.snake.length) * 0.3;
                this.ctx.fillStyle = `rgba(76, 175, 80, ${alpha})`;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            }
        });
    }
    
    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏暂停', this.canvasSize / 2, this.canvasSize / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('按空格键继续', this.canvasSize / 2, this.canvasSize / 2 + 50);
    }
    
    gameLoop(currentTime) {
        this.update(currentTime);
        this.render();
        
        if (this.gameState !== 'menu') {
            this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});