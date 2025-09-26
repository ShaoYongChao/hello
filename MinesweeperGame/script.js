class MinesweeperGame {
    constructor() {
        this.board = [];
        this.width = 9;
        this.height = 9;
        this.mineCount = 10;
        this.revealedCount = 0;
        this.flaggedCount = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.createBoard();
    }
    
    initializeElements() {
        this.gameBoard = document.getElementById('game-board');
        this.minesCountElement = document.getElementById('mines-count');
        this.timerElement = document.getElementById('timer');
        this.gameMessage = document.getElementById('game-message');
        this.restartBtn = document.getElementById('restart');
        
        this.difficultySelect = document.getElementById('difficulty-select');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsPanel = document.getElementById('settings-panel');
        this.applyCustomBtn = document.getElementById('apply-custom');
        this.closeSettingsBtn = document.getElementById('close-settings');
        
        this.customWidth = document.getElementById('custom-width');
        this.customHeight = document.getElementById('custom-height');
        this.customMines = document.getElementById('custom-mines');
    }
    
    setupEventListeners() {
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        this.difficultySelect.addEventListener('change', (e) => this.handleDifficultyChange(e));
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.applyCustomBtn.addEventListener('click', () => this.applyCustomSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        
        // 点击设置面板外部关闭
        this.settingsPanel.addEventListener('click', (e) => {
            if (e.target === this.settingsPanel) {
                this.hideSettings();
            }
        });
        
        // 防止右键菜单
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleDifficultyChange(e) {
        const value = e.target.value;
        
        switch (value) {
            case 'beginner':
                this.setDifficulty(9, 9, 10);
                break;
            case 'intermediate':
                this.setDifficulty(16, 16, 40);
                break;
            case 'expert':
                this.setDifficulty(30, 16, 99);
                break;
            case 'custom':
                this.showSettings();
                break;
        }
    }
    
    setDifficulty(width, height, mines) {
        this.width = width;
        this.height = height;
        this.mineCount = mines;
        this.restartGame();
    }
    
    showSettings() {
        this.settingsPanel.classList.remove('hidden');
        // 更新自定义输入框的值
        this.customWidth.value = this.width;
        this.customHeight.value = this.height;
        this.customMines.value = this.mineCount;
    }
    
    hideSettings() {
        this.settingsPanel.classList.add('hidden');
        // 如果当前不是自定义模式，重置下拉选择
        if (this.difficultySelect.value === 'custom') {
            if (this.width === 9 && this.height === 9 && this.mineCount === 10) {
                this.difficultySelect.value = 'beginner';
            } else if (this.width === 16 && this.height === 16 && this.mineCount === 40) {
                this.difficultySelect.value = 'intermediate';
            } else if (this.width === 30 && this.height === 16 && this.mineCount === 99) {
                this.difficultySelect.value = 'expert';
            }
        }
    }
    
    applyCustomSettings() {
        const width = parseInt(this.customWidth.value);
        const height = parseInt(this.customHeight.value);
        const mines = parseInt(this.customMines.value);
        
        if (width < 5 || width > 30 || height < 5 || height > 24) {
            alert('宽度范围：5-30，高度范围：5-24');
            return;
        }
        
        if (mines < 1 || mines >= width * height) {
            alert('雷数必须在1到' + (width * height - 1) + '之间');
            return;
        }
        
        this.width = width;
        this.height = height;
        this.mineCount = mines;
        this.difficultySelect.value = 'custom';
        this.hideSettings();
        this.restartGame();
    }
    
    restartGame() {
        this.board = [];
        this.revealedCount = 0;
        this.flaggedCount = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.updateDisplay();
        this.hideMessage();
        this.createBoard();
        this.restartBtn.textContent = '🙂';
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.width}, 1fr)`;
        
        // 初始化棋盘
        for (let row = 0; row < this.height; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.width; col++) {
                this.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
                
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e));
                
                this.gameBoard.appendChild(cell);
            }
        }
    }
    
    placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.height);
            const col = Math.floor(Math.random() * this.width);
            
            // 不在第一次点击的位置和已有雷的位置放雷
            if ((row !== excludeRow || col !== excludeCol) && !this.board[row][col].isMine) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
        
        // 计算每个格子周围的雷数
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }
    
    countNeighborMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (this.isValidCell(newRow, newCol) && this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }
    
    isValidCell(row, col) {
        return row >= 0 && row < this.height && col >= 0 && col < this.width;
    }
    
    handleCellClick(e) {
        if (this.gameOver) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const cell = this.board[row][col];
        
        if (cell.isFlagged || cell.isRevealed) return;
        
        // 第一次点击时放置雷
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        this.revealCell(row, col);
        this.updateDisplay();
        this.checkWinCondition();
    }
    
    handleRightClick(e) {
        e.preventDefault();
        if (this.gameOver) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        const cell = this.board[row][col];
        
        if (cell.isRevealed) return;
        
        if (cell.isFlagged) {
            cell.isFlagged = false;
            this.flaggedCount--;
            e.target.textContent = '';
            e.target.classList.remove('flagged');
        } else {
            cell.isFlagged = true;
            this.flaggedCount++;
            e.target.textContent = '🚩';
            e.target.classList.add('flagged');
        }
        
        this.updateDisplay();
    }
    
    revealCell(row, col) {
        const cell = this.board[row][col];
        if (cell.isRevealed || cell.isFlagged) return;
        
        cell.isRevealed = true;
        this.revealedCount++;
        
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellElement.classList.add('revealed');
        
        if (cell.isMine) {
            cellElement.textContent = '💣';
            cellElement.classList.add('mine');
            this.gameOver = true;
            this.restartBtn.textContent = '😵';
            this.revealAllMines();
            this.showMessage('游戏结束！', 'lose');
            this.stopTimer();
        } else if (cell.neighborMines > 0) {
            cellElement.textContent = cell.neighborMines;
            cellElement.classList.add(`number-${cell.neighborMines}`);
        } else {
            // 自动揭开周围的空格
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (this.isValidCell(newRow, newCol)) {
                        this.revealCell(newRow, newCol);
                    }
                }
            }
        }
    }
    
    revealAllMines() {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.board[row][col].isMine) {
                    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (!this.board[row][col].isFlagged) {
                        cellElement.textContent = '💣';
                        cellElement.classList.add('mine');
                    }
                }
            }
        }
    }
    
    checkWinCondition() {
        const totalCells = this.width * this.height;
        if (this.revealedCount === totalCells - this.mineCount) {
            this.gameWon = true;
            this.gameOver = true;
            this.restartBtn.textContent = '😎';
            this.showMessage('恭喜你赢了！', 'win');
            this.stopTimer();
            
            // 自动标记所有剩余的雷
            for (let row = 0; row < this.height; row++) {
                for (let col = 0; col < this.width; col++) {
                    if (this.board[row][col].isMine && !this.board[row][col].isFlagged) {
                        this.board[row][col].isFlagged = true;
                        this.flaggedCount++;
                        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                        cellElement.textContent = '🚩';
                        cellElement.classList.add('flagged');
                    }
                }
            }
            this.updateDisplay();
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timerElement.textContent = this.timer.toString().padStart(3, '0');
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateDisplay() {
        this.minesCountElement.textContent = Math.max(0, this.mineCount - this.flaggedCount).toString().padStart(3, '0');
        this.timerElement.textContent = this.timer.toString().padStart(3, '0');
    }
    
    showMessage(text, type) {
        this.gameMessage.textContent = text;
        this.gameMessage.className = `game-message ${type}`;
        this.gameMessage.classList.remove('hidden');
    }
    
    hideMessage() {
        this.gameMessage.classList.add('hidden');
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new MinesweeperGame();
});