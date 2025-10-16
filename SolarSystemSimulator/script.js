class SolarSystemSimulator {
    constructor() {
        this.isPlaying = true;
        this.speed = 1;
        this.init();
    }

    init() {
        this.setupControls();
        this.setupPlanetInfo();
        this.setupPlanetList();
        this.updateAnimationSpeed();
        this.setupCanvas();
    }

    setupControls() {
        const playPauseBtn = document.getElementById('playPause');
        const resetBtn = document.getElementById('reset');
        const speedSlider = document.getElementById('speed');
        const speedValue = document.getElementById('speedValue');

        playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });

        resetBtn.addEventListener('click', () => {
            this.reset();
        });

        speedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            speedValue.textContent = `${this.speed}x`;
            this.updateAnimationSpeed();
        });
    }

    togglePlayPause() {
        const playPauseBtn = document.getElementById('playPause');
        const solarSystem = document.querySelector('.solar-system');
        
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            playPauseBtn.textContent = '暂停';
            solarSystem.classList.remove('paused');
        } else {
            playPauseBtn.textContent = '播放';
            solarSystem.classList.add('paused');
        }
    }

    reset() {
        // 仅重置速度为 1，并同步 UI 与动画速度
        this.speed = 1;
        const speedSlider = document.getElementById('speed');
        const speedValue = document.getElementById('speedValue');
        if (speedSlider) speedSlider.value = '1';
        if (speedValue) speedValue.textContent = '1x';
        this.updateAnimationSpeed();
    }

    updateAnimationSpeed() {
        const style = document.createElement('style');
        style.textContent = `
            .mercury-orbit { animation-duration: ${10 / this.speed}s !important; }
            .venus-orbit { animation-duration: ${15 / this.speed}s !important; }
            .earth-orbit { animation-duration: ${20 / this.speed}s !important; }
            .mars-orbit { animation-duration: ${30 / this.speed}s !important; }
            .jupiter-orbit { animation-duration: ${50 / this.speed}s !important; }
            .saturn-orbit { animation-duration: ${70 / this.speed}s !important; }
            .uranus-orbit { animation-duration: ${90 / this.speed}s !important; }
            .neptune-orbit { animation-duration: ${120 / this.speed}s !important; }
            .moon-orbit { animation-duration: ${2 / this.speed}s !important; }
        `;
        
        // 移除旧的样式
        const oldStyle = document.querySelector('#dynamic-speed-style');
        if (oldStyle) {
            oldStyle.remove();
        }
        
        style.id = 'dynamic-speed-style';
        document.head.appendChild(style);
    }

    setupPlanetInfo() {
        const planets = document.querySelectorAll('.planet');
        const sun = document.querySelector('.sun');
        const infoPanel = document.getElementById('planet-info');

        const planetData = {
            mercury: {
                name: '水星',
                distance: '5790万公里',
                period: '88天',
                description: '距离太阳最近的行星，表面温度极高。'
            },
            venus: {
                name: '金星',
                distance: '1.08亿公里',
                period: '225天',
                description: '被称为"启明星"，拥有浓厚的大气层。'
            },
            earth: {
                name: '地球',
                distance: '1.5亿公里',
                period: '365天',
                description: '我们的家园，唯一已知存在生命的行星。'
            },
            mars: {
                name: '火星',
                distance: '2.28亿公里',
                period: '687天',
                description: '红色星球，可能曾经存在液态水。'
            },
            jupiter: {
                name: '木星',
                distance: '7.78亿公里',
                period: '12年',
                description: '太阳系最大的行星，拥有大红斑风暴。'
            },
            saturn: {
                name: '土星',
                distance: '14.3亿公里',
                period: '29年',
                description: '拥有美丽光环的气态巨行星。'
            },
            uranus: {
                name: '天王星',
                distance: '28.7亿公里',
                period: '84年',
                description: '侧躺着自转的冰巨星。'
            },
            neptune: {
                name: '海王星',
                distance: '45亿公里',
                period: '165年',
                description: '太阳系最外层的行星，风速极高。'
            }
        };

        sun.addEventListener('click', () => {
            this.highlightCelestialBody('sun');
            infoPanel.innerHTML = `
                <h4>太阳</h4>
                <p><strong>类型:</strong> 恒星</p>
                <p><strong>直径:</strong> 139万公里</p>
                <p><strong>温度:</strong> 5778K</p>
                <p><strong>描述:</strong> 太阳系的中心，为所有行星提供光和热。</p>
            `;
        });

        planets.forEach(planet => {
            planet.addEventListener('click', (e) => {
                e.stopPropagation();
                const planetType = planet.dataset.planet;
                
                if (planetType && planetData[planetType]) {
                    this.highlightCelestialBody(planetType);
                    const data = planetData[planetType];
                    infoPanel.innerHTML = `
                        <h4>${data.name}</h4>
                        <p><strong>距离太阳:</strong> ${data.distance}</p>
                        <p><strong>公转周期:</strong> ${data.period}</p>
                        <p><strong>描述:</strong> ${data.description}</p>
                    `;
                }
            });
        });
    }

    setupPlanetList() {
        const planetItems = document.querySelectorAll('.planet-item');
        const infoPanel = document.getElementById('planet-info');

        const planetData = {
            sun: {
                name: '太阳',
                type: '恒星',
                diameter: '139万公里',
                temperature: '5778K',
                description: '太阳系的中心，为所有行星提供光和热。'
            },
            mercury: {
                name: '水星',
                distance: '5790万公里',
                period: '88天',
                description: '距离太阳最近的行星，表面温度极高。'
            },
            venus: {
                name: '金星',
                distance: '1.08亿公里',
                period: '225天',
                description: '被称为"启明星"，拥有浓厚的大气层。'
            },
            earth: {
                name: '地球',
                distance: '1.5亿公里',
                period: '365天',
                description: '我们的家园，唯一已知存在生命的行星。'
            },
            mars: {
                name: '火星',
                distance: '2.28亿公里',
                period: '687天',
                description: '红色星球，可能曾经存在液态水。'
            },
            jupiter: {
                name: '木星',
                distance: '7.78亿公里',
                period: '12年',
                description: '太阳系最大的行星，拥有大红斑风暴。'
            },
            saturn: {
                name: '土星',
                distance: '14.3亿公里',
                period: '29年',
                description: '拥有美丽光环的气态巨行星。'
            },
            uranus: {
                name: '天王星',
                distance: '28.7亿公里',
                period: '84年',
                description: '侧躺着自转的冰巨星。'
            },
            neptune: {
                name: '海王星',
                distance: '45亿公里',
                period: '165年',
                description: '太阳系最外层的行星，风速极高。'
            }
        };

        planetItems.forEach(item => {
            item.addEventListener('click', () => {
                const planetType = item.dataset.planet;
                this.highlightCelestialBody(planetType);
                
                const data = planetData[planetType];
                if (planetType === 'sun') {
                    infoPanel.innerHTML = `
                        <h4>${data.name}</h4>
                        <p><strong>类型:</strong> ${data.type}</p>
                        <p><strong>直径:</strong> ${data.diameter}</p>
                        <p><strong>温度:</strong> ${data.temperature}</p>
                        <p><strong>描述:</strong> ${data.description}</p>
                    `;
                } else {
                    infoPanel.innerHTML = `
                        <h4>${data.name}</h4>
                        <p><strong>距离太阳:</strong> ${data.distance}</p>
                        <p><strong>公转周期:</strong> ${data.period}</p>
                        <p><strong>描述:</strong> ${data.description}</p>
                    `;
                }
            });
        });
    }

    highlightCelestialBody(type) {
        // 清除所有高亮
        document.querySelectorAll('.planet-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.planet, .sun').forEach(body => {
            body.classList.remove('highlighted');
        });

        // 高亮选中的列表项
        const listItem = document.querySelector(`[data-planet="${type}"]`);
        if (listItem) {
            listItem.classList.add('active');
        }

        // 高亮选中的天体
        if (type === 'sun') {
            const sun = document.querySelector('.sun');
            if (sun) {
                sun.classList.add('highlighted');
            }
        } else {
            const planet = document.querySelector(`.${type}`);
            if (planet) {
                planet.classList.add('highlighted');
            }
        }
    }
}

SolarSystemSimulator.prototype.setupCanvas = function() {
    const container = document.querySelector('.solar-system');
    const canvas = document.getElementById('space-canvas');
    if (!container || !canvas) return;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        this.cx = canvas.width / 2;
        this.cy = canvas.height / 2;
        this.scaleY = 0.8; // 椭圆纵向压缩比例
    };
    window.addEventListener('resize', resize);
    resize();

    this.loadImages().then(() => {
        this.initPlanets();
        this.lastTs = performance.now();
        const tick = (ts) => {
            if (!this.isPlaying) {
                this.lastTs = ts;
                requestAnimationFrame(tick);
                return;
            }
            const dt = Math.min(50, ts - this.lastTs); // ms
            this.lastTs = ts;
            this.update(dt);
            this.draw();
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
};

SolarSystemSimulator.prototype.loadImages = function() {
    const urls = {
        sun: 'https://img.alicdn.com/imgextra/i1/O1CN01oVLbLx22VlN34KDQs_!!6000000007126-2-tps-800-800.png',
        mercury: 'https://img.alicdn.com/imgextra/i2/O1CN01UjgqIB1SrRxQfrflh_!!6000000002300-2-tps-800-800.png',
        venus: 'https://img.alicdn.com/imgextra/i3/O1CN01JGEgLU1dfxnVvp91R_!!6000000003764-2-tps-800-800.png',
        earth: 'https://img.alicdn.com/imgextra/i4/O1CN01R6wlzD1IhhMlBcGLg_!!6000000000925-2-tps-800-800.png',
        moon: 'https://img.alicdn.com/imgextra/i4/O1CN01Ad5SeB20tv1nfRoA2_!!6000000006908-2-tps-800-800.png',
        mars: 'https://img.alicdn.com/imgextra/i1/O1CN01OlZAk81OVEHJ0pazq_!!6000000001710-2-tps-800-800.png',
        jupiter: 'https://img.alicdn.com/imgextra/i2/O1CN01MA3Mk51bAhWxWxHim_!!6000000003425-2-tps-800-800.png',
        saturn: 'https://img.alicdn.com/imgextra/i2/O1CN01NG2FjS1XDDEofNNhg_!!6000000002889-2-tps-800-800.png',
        uranus: 'https://img.alicdn.com/imgextra/i1/O1CN01wnxTX51xIPkTHqPBr_!!6000000006420-2-tps-800-800.png',
        neptune: 'https://img.alicdn.com/imgextra/i1/O1CN01LTf0rT25zwJWsIDkD_!!6000000007598-2-tps-800-800.png'
    };
    this.images = {};
    const load = (key, src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ key, img });
        img.onerror = reject;
        img.src = src;
    });
    const tasks = Object.entries(urls).map(([k, v]) => load(k, v));
    return Promise.all(tasks).then(res => {
        res.forEach(({ key, img }) => this.images[key] = img);
    });
};

SolarSystemSimulator.prototype.initPlanets = function() {
    this.planetConfigs = [
        { key: 'mercury', rx: 60, factor: 4, size: 5 },
        { key: 'venus',   rx: 90, factor: 3, size: 8 },
        { key: 'earth',   rx: 120, factor: 2, size: 10 },
        { key: 'mars',    rx: 150, factor: 1.5, size: 7 },
        { key: 'jupiter', rx: 180, factor: 1, size: 12 },
        { key: 'saturn',  rx: 210, factor: 0.8, size: 24 },
        { key: 'uranus',  rx: 240, factor: 0.5, size: 9 },
        { key: 'neptune', rx: 270, factor: 0.4, size: 8 }
    ];
    this.angles = {};
    this.planetConfigs.forEach(p => this.angles[p.key] = 0);
    this.moonAngle = 0;
    this.baseAngularSpeed = 0.0015; // rad/ms
};

SolarSystemSimulator.prototype.update = function(dt) {
    const speed = this.speed;
    this.planetConfigs.forEach(p => {
        this.angles[p.key] += dt * this.baseAngularSpeed * p.factor * speed;
    });
    this.moonAngle += dt * this.baseAngularSpeed * 6 * speed;
};

SolarSystemSimulator.prototype.draw = function() {
    const ctx = this.ctx;
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cx = this.cx;
    const cy = this.cy;
    const scaleY = this.scaleY || 1;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 轨道 - 虚线+透明度0.2
    ctx.save();
    ctx.setLineDash([6 * dpr, 6 * dpr]);
    ctx.lineWidth = 1 * dpr;
    ctx.strokeStyle = 'white';
    ctx.globalAlpha = 0.2;
    (this.planetConfigs || []).forEach(p => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, p.rx * dpr, p.rx * scaleY * dpr, 0, 0, Math.PI * 2);
        ctx.stroke();
    });
    ctx.restore();

    // 太阳 60px
    if (this.images && this.images.sun) {
        const size = 60 * dpr;
        ctx.drawImage(this.images.sun, cx - size / 2, cy - size / 2, size, size);
    }

    // 行星与地月
    (this.planetConfigs || []).forEach(p => {
        const a = this.angles[p.key];
        const rx = p.rx * dpr;
        const ry = p.rx * scaleY * dpr;
        const x = cx + rx * Math.cos(a);
        const y = cy + ry * Math.sin(a);
        const img = this.images[p.key];
        if (img) {
            const size = p.size * dpr;
            ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        }
        if (p.key === 'earth' && this.images.moon) {
            const orbitR = 10 * dpr;
            const moonSize = 20 * dpr; // 直径=20px（半径10px）
            const mx = x + orbitR * Math.cos(this.moonAngle);
            const my = y + orbitR * Math.sin(this.moonAngle) * scaleY;

            // 月球轨道
            ctx.save();
            ctx.setLineDash([4 * dpr, 4 * dpr]);
            ctx.lineWidth = 1 * dpr;
            ctx.strokeStyle = 'white';
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.ellipse(x, y, orbitR, orbitR * scaleY, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            ctx.drawImage(this.images.moon, mx - moonSize / 2, my - moonSize / 2, moonSize, moonSize);
        }
    });
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new SolarSystemSimulator();
});

// 添加一些视觉效果
document.addEventListener('DOMContentLoaded', () => {
    // 创建星空背景
    createStarField();
});

function createStarField() {
    const starField = document.createElement('div');
    starField.style.position = 'fixed';
    starField.style.top = '0';
    starField.style.left = '0';
    starField.style.width = '100%';
    starField.style.height = '100%';
    starField.style.pointerEvents = 'none';
    starField.style.zIndex = '-1';
    
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.style.position = 'absolute';
        const size = (Math.random() * 0.5 + 0.5);
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.backgroundColor = 'white';
        star.style.borderRadius = '50%';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.opacity = (Math.random() * 0.5 + 0.5).toFixed(2);
        
        // 添加闪烁效果
        star.style.animation = `twinkle ${Math.random() * 3 + 2}s infinite`;
        
        starField.appendChild(star);
    }
    
    document.body.appendChild(starField);
    
    // 添加闪烁动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}