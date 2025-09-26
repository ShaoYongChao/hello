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
        const orbits = document.querySelectorAll('.orbit');
        const moonOrbit = document.querySelector('.moon-orbit');
        
        // 重置所有轨道动画
        orbits.forEach(orbit => {
            orbit.style.animation = 'none';
            orbit.offsetHeight; // 触发重排
            orbit.style.animation = null;
        });
        
        if (moonOrbit) {
            moonOrbit.style.animation = 'none';
            moonOrbit.offsetHeight;
            moonOrbit.style.animation = null;
        }
        
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
        star.style.width = Math.random() * 2 + 'px';
        star.style.height = star.style.width;
        star.style.backgroundColor = 'white';
        star.style.borderRadius = '50%';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.opacity = Math.random() * 0.8 + 0.2;
        
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