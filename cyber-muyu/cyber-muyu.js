class CyberMuyu {
    constructor() {
        this.merit = 0;
        this.todayHits = 0;
        this.totalHits = 0;
        this.level = 1;
        this.isLevelUpShowing = false; // 添加标志位防止重复显示
        
        // 功德等级配置
        this.levels = [
            { name: '初心', requirement: 0, color: '#ffffff' },
            { name: '入门', requirement: 100, color: '#00ffff' },
            { name: '小成', requirement: 500, color: '#00ff00' },
            { name: '有成', requirement: 1500, color: '#ffff00' },
            { name: '大成', requirement: 3000, color: '#ff8800' },
            { name: '圆满', requirement: 6000, color: '#ff0088' },
            { name: '得道', requirement: 10000, color: '#8800ff' },
            { name: '成佛', requirement: 20000, color: '#ffd700' }
        ];
        
        this.initializeElements();
        this.loadData();
        this.setupEventListeners();
        this.updateDisplay();
        this.startAutoSave();
    }
    
    initializeElements() {
        this.meritCounter = document.getElementById('merit-counter');
        this.muyu = document.getElementById('muyu');
        this.hammer = document.getElementById('hammer');
        this.hitEffect = document.getElementById('hit-effect');
        this.particlesContainer = document.getElementById('particles-container');
        this.todayHitsElement = document.getElementById('today-hits');
        this.totalHitsElement = document.getElementById('total-hits');
        this.meritLevelElement = document.getElementById('merit-level');
        this.progressFill = document.getElementById('progress-fill');
        this.levelText = document.getElementById('level-text');
        this.nextLevelNeed = document.getElementById('next-level-need');
        this.resetBtn = document.getElementById('reset-btn');
        this.hitSound = document.getElementById('hit-sound');
    }
    
    setupEventListeners() {
        this.muyu.addEventListener('click', (e) => this.hitMuyu(e));
        this.resetBtn.addEventListener('click', () => this.resetProgress());
        
        // 键盘支持
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.hitMuyu();
            }
        });
        
        // 防止右键菜单
        this.muyu.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    hitMuyu(e) {
        // 增加功德和统计
        const meritGain = this.calculateMeritGain();
        this.merit += meritGain;
        this.todayHits++;
        this.totalHits++;
        
        // 播放音效
        this.playHitSound();
        
        // 视觉效果
        this.showHammerAnimation();
        this.showMuyuAnimation();
        this.showHitEffect();
        this.createParticles(e);
        this.animateMeritCounter(meritGain);
        
        // 更新显示
        this.updateDisplay();
        this.checkLevelUp();
        
        // 保存数据
        this.saveData();
    }
    
    calculateMeritGain() {
        // 基础功德值
        let baseGain = 1;
        
        // 等级加成
        const levelBonus = Math.floor(this.level / 2);
        
        // 随机加成 (1-5% 概率获得额外功德)
        const randomBonus = Math.random() < 0.05 ? Math.floor(Math.random() * 5) + 1 : 0;
        
        return baseGain + levelBonus + randomBonus;
    }
    
    playHitSound() {
        // 创建简单的敲击音效
        if (this.audioContext) {
            this.createBeepSound();
        } else {
            // 备用方案：使用HTML5 Audio
            try {
                this.hitSound.currentTime = 0;
                this.hitSound.play().catch(() => {
                    // 忽略播放错误
                });
            } catch (e) {
                // 忽略音频错误
            }
        }
    }
    
    createBeepSound() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            // 忽略音频上下文错误
        }
    }
    
    showHammerAnimation() {
        // 添加锤子敲击动画
        this.hammer.classList.add('hit');
        setTimeout(() => {
            this.hammer.classList.remove('hit');
        }, 100);
    }
    
    showMuyuAnimation() {
        // 添加木鱼放大动画
        this.muyu.classList.add('hit');
        setTimeout(() => {
            this.muyu.classList.remove('hit');
        }, 100);
    }
    
    showHitEffect() {
        this.hitEffect.classList.remove('active');
        setTimeout(() => {
            this.hitEffect.classList.add('active');
        }, 10);
    }
    
    createParticles(e) {
        const particleCount = 8;
        // 粒子从木鱼容器的中心发射，而不是从点击位置
        const centerX = 0; // 相对于 particles-container 的中心
        const centerY = 0; // 相对于 particles-container 的中心
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 100 + Math.random() * 50;
            const lifetime = 1000 + Math.random() * 500;
            
            // 从木鱼中心开始
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            
            this.particlesContainer.appendChild(particle);
            
            // 动画粒子
            const startTime = Date.now();
            const animateParticle = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / lifetime;
                
                if (progress >= 1) {
                    particle.remove();
                    return;
                }
                
                const distance = velocity * progress;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                const opacity = 1 - progress;
                
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.opacity = opacity;
                
                requestAnimationFrame(animateParticle);
            };
            
            requestAnimationFrame(animateParticle);
        }
    }
    
    animateMeritCounter(gain) {
        // 创建飞入的功德数字
        const gainElement = document.createElement('div');
        gainElement.textContent = `+${gain}`;
        gainElement.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #00ffff;
            font-size: 1.5em;
            font-weight: bold;
            pointer-events: none;
            z-index: 100;
            text-shadow: 0 0 10px #00ffff;
        `;
        
        this.meritCounter.parentElement.appendChild(gainElement);
        
        // 动画效果
        let progress = 0;
        const animate = () => {
            progress += 0.02;
            if (progress >= 1) {
                gainElement.remove();
                return;
            }
            
            const y = -50 - progress * 50;
            const opacity = 1 - progress;
            const scale = 1 + progress * 0.5;
            
            gainElement.style.transform = `translate(-50%, ${y}px) scale(${scale})`;
            gainElement.style.opacity = opacity;
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
    
    updateDisplay() {
        // 更新功德显示
        this.meritCounter.textContent = this.merit.toLocaleString();
        
        // 更新统计
        this.todayHitsElement.textContent = this.todayHits.toLocaleString();
        this.totalHitsElement.textContent = this.totalHits.toLocaleString();
        
        // 更新等级信息
        this.updateLevelDisplay();
    }
    
    updateLevelDisplay() {
        const currentLevel = this.getCurrentLevel();
        const nextLevel = this.getNextLevel();
        
        // 只更新显示，不修改等级值（等级值在checkLevelUp中更新）
        this.meritLevelElement.textContent = currentLevel.name;
        this.meritLevelElement.style.color = currentLevel.color;
        
        if (nextLevel) {
            const progress = (this.merit - currentLevel.requirement) / (nextLevel.requirement - currentLevel.requirement);
            const progressPercent = Math.min(progress * 100, 100);
            
            this.progressFill.style.width = progressPercent + '%';
            this.nextLevelNeed.textContent = (nextLevel.requirement - this.merit).toLocaleString();
            this.levelText.style.display = 'block';
        } else {
            this.progressFill.style.width = '100%';
            this.levelText.style.display = 'none';
        }
    }
    
    getCurrentLevel() {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (this.merit >= this.levels[i].requirement) {
                return { ...this.levels[i], index: i };
            }
        }
        return { ...this.levels[0], index: 0 };
    }
    
    getNextLevel() {
        const currentLevel = this.getCurrentLevel();
        const nextIndex = currentLevel.index + 1;
        return nextIndex < this.levels.length ? this.levels[nextIndex] : null;
    }
    
    checkLevelUp() {
        const currentLevel = this.getCurrentLevel();
        const newLevel = currentLevel.index + 1;
        
        // 只有当等级真正提升且没有正在显示升级提示时才显示
        if (newLevel > this.level && !this.isLevelUpShowing) {
            this.level = newLevel; // 更新等级
            this.showLevelUpEffect(currentLevel);
        }
    }
    
    showLevelUpEffect(level) {
        // 如果已经在显示升级提示，则不创建新的
        if (this.isLevelUpShowing) {
            return;
        }
        
        this.isLevelUpShowing = true;
        
        // 创建升级提示
        const levelUpElement = document.createElement('div');
        levelUpElement.innerHTML = `
            <div style="
                position: fixed;
                top: 20%;
                right: 20px;
                transform: translateY(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: ${level.color};
                padding: 25px 20px;
                border-radius: 15px;
                text-align: center;
                font-size: 1.5em;
                font-weight: bold;
                z-index: 1000;
                border: 2px solid ${level.color};
                box-shadow: 0 0 30px ${level.color};
                animation: levelUpSlideIn 3s ease-in-out;
                min-width: 200px;
                backdrop-filter: blur(10px);
            ">
                🎉 功德提升 🎉<br>
                <span style="font-size: 1.2em; margin-top: 8px; display: block;">
                    ${level.name}
                </span>
            </div>
        `;
        
        document.body.appendChild(levelUpElement);
        
        // 添加动画样式（只添加一次）
        if (!document.getElementById('levelUpAnimation')) {
            const style = document.createElement('style');
            style.id = 'levelUpAnimation';
            style.textContent = `
                @keyframes levelUpSlideIn {
                    0% { 
                        transform: translateY(-50%) translateX(100%);
                        opacity: 0;
                    }
                    15% { 
                        transform: translateY(-50%) translateX(0);
                        opacity: 1;
                    }
                    85% { 
                        transform: translateY(-50%) translateX(0);
                        opacity: 1;
                    }
                    100% { 
                        transform: translateY(-50%) translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 3秒后移除并重置标志位
        setTimeout(() => {
            levelUpElement.remove();
            this.isLevelUpShowing = false;
        }, 3000);
    }
    
    resetProgress() {
        if (confirm('确定要重置所有功德进度吗？此操作不可恢复！')) {
            this.merit = 0;
            this.todayHits = 0;
            this.totalHits = 0;
            this.level = 1;
            
            this.updateDisplay();
            this.saveData();
            
            // 显示重置提示
            const resetElement = document.createElement('div');
            resetElement.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(255, 0, 0, 0.9);
                    color: white;
                    padding: 20px;
                    border-radius: 15px;
                    text-align: center;
                    font-size: 1.2em;
                    font-weight: bold;
                    z-index: 1000;
                ">
                    功德已重置 🔄
                </div>
            `;
            
            document.body.appendChild(resetElement);
            setTimeout(() => resetElement.remove(), 2000);
        }
    }
    
    saveData() {
        const data = {
            merit: this.merit,
            todayHits: this.todayHits,
            totalHits: this.totalHits,
            lastSaveDate: new Date().toDateString()
        };
        
        localStorage.setItem('cyberMuyuData', JSON.stringify(data));
    }
    
    loadData() {
        try {
            const savedData = localStorage.getItem('cyberMuyuData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                this.merit = data.merit || 0;
                this.totalHits = data.totalHits || 0;
                
                // 检查是否是新的一天
                const today = new Date().toDateString();
                if (data.lastSaveDate === today) {
                    this.todayHits = data.todayHits || 0;
                } else {
                    this.todayHits = 0;
                }
            }
        } catch (e) {
            console.log('加载数据失败，使用默认值');
        }
    }
    
    startAutoSave() {
        // 每30秒自动保存一次
        setInterval(() => {
            this.saveData();
        }, 30000);
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new CyberMuyu();
    
    // 添加页面可见性检测，页面重新可见时保存数据
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.cyberMuyu) {
            window.cyberMuyu.saveData();
        }
    });
});

// 页面卸载时保存数据
window.addEventListener('beforeunload', () => {
    if (window.cyberMuyu) {
        window.cyberMuyu.saveData();
    }
});