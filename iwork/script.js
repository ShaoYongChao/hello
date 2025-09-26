const body = document.body;

// 用户自定义下班时间设置
let workEndTime = {
    hour: 17, // 默认17点
    minute: 0 // 默认0分
};

// 拖尾效果配置
const trailConfig = {
    // 拖尾元素数量
    trailCount: 15,
    // 最小尺寸
    minSize: 5,
    // 最大尺寸
    maxSize: 20,
    // 拖尾元素跟随速度系数
    followSpeed: 0.15,
    // 拖尾元素生命周期（毫秒）
    lifeSpan: 2000,
    // 是否使用随机颜色
    useRandomColors: true,
    // 默认颜色
    defaultColor: 'rgba(255, 255, 255, 0.7)',
    // 鼠标停止检测时间阈值（毫秒）
    mouseRestThreshold: 1000
};

// 爆炸效果配置
const explosionConfig = {
    // 每次爆炸生成的粒子数量
    particleCount: 30,
    // 粒子最小大小
    minParticleSize: 3,
    // 粒子最大大小
    maxParticleSize: 12,
    // 粒子最大速度
    maxSpeed: 6,
    // 粒子动画持续时间
    animationDuration: 1000,
    // 颜色主题
    colorThemes: [
        // 主题1: 火焰爆炸
        ['#ff5722', '#ff9800', '#ffeb3b', '#ff5252'],
        // 主题2: 冰晶爆炸
        ['#b3e5fc', '#4fc3f7', '#03a9f4', '#0288d1'],
        // 主题3: 彩虹爆炸
        ['#ff4081', '#536dfe', '#00c853', '#ffd600']
    ],
    // 是否使用随机主题
    useRandomTheme: true,
    // 是否使用径向渐变作为粒子颜色
    useRadialGradient: true
};

// 存储拖尾元素信息的数组
const trailElements = [];

// 上一个鼠标位置
let lastMouseX = 0;
let lastMouseY = 0;

// 最后一次鼠标移动的时间戳
let lastMovementTime = Date.now();

// 是否已经在当前停止位置播放过爆炸效果
let hasExplodedAtRest = false;

// 生成随机颜色（用于拖尾）
function getTrailRandomColor() {
    if (!trailConfig.useRandomColors) return trailConfig.defaultColor;
    
    // 生成柔和的随机颜色
    const hue = Math.random() * 360;
    const saturation = 70 + Math.random() * 30;
    const lightness = 60 + Math.random() * 20;
    const alpha = 0.5 + Math.random() * 0.5;
    
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

// 生成随机颜色（用于爆炸）
function getExplosionRandomColor() {
    // 选择一个主题
    const themeIndex = explosionConfig.useRandomTheme 
        ? Math.floor(Math.random() * explosionConfig.colorThemes.length) 
        : 0;
    const theme = explosionConfig.colorThemes[themeIndex];
    
    // 从主题中随机选择一种颜色
    const colorIndex = Math.floor(Math.random() * theme.length);
    return theme[colorIndex];
}

// 创建拖尾元素
function createTrailElement(x, y) {
    const size = trailConfig.minSize + Math.random() * (trailConfig.maxSize - trailConfig.minSize);
    
    const trail = document.createElement('div');
    trail.classList.add('trail');
    
    // 设置初始样式
    trail.style.width = `${size}px`;
    trail.style.height = `${size}px`;
    trail.style.backgroundColor = getTrailRandomColor();
    trail.style.left = `${x - size/2}px`;
    trail.style.top = `${y - size/2}px`;
    trail.style.opacity = '0.7';
    
    // 添加到body
    body.appendChild(trail);
    
    // 返回元素信息对象
    return {
        element: trail,
        x: x,
        y: y,
        targetX: x,
        targetY: y,
        size: size,
        createdAt: Date.now()
    };
}

// 创建爆炸效果
function createExplosion(x, y) {
    // 使用Canvas绘制粒子，性能更好
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置canvas大小为视口的2倍，以支持高DPI显示器
    const dpr = window.devicePixelRatio || 1;
    const size = 600; // 调整爆炸效果的范围，避免裁切
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.style.position = 'fixed';
    canvas.style.left = `${x - size/2}px`;
    canvas.style.top = `${y - size/2}px`;
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';
    
    // 保存原点偏移
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(dpr, dpr);
    
    // 添加到body
    body.appendChild(canvas);
    
    // 创建粒子数据
    const particles = [];
    for (let i = 0; i < explosionConfig.particleCount; i++) {
        const size = explosionConfig.minParticleSize + Math.random() * 
                     (explosionConfig.maxParticleSize - explosionConfig.minParticleSize);
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * explosionConfig.maxSpeed;
        const color = getExplosionRandomColor();
        
        particles.push({
            x: 0,
            y: 0,
            size: size,
            angle: angle,
            speed: speed,
            color: color,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            alpha: 1,
            decay: 0.01 + Math.random() * 0.02
        });
    }
    
    // 动画变量
    let startTime = null;
    
    // 动画函数
    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / explosionConfig.animationDuration, 1);
        
        // 清空画布
        ctx.clearRect(-size, -size, size*2, size*2);
        
        // 更新和绘制所有粒子
        particles.forEach(particle => {
            // 更新位置
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 添加一些重力效果
            particle.vy += 0.1;
            
            // 减速
            particle.vx *= 0.96;
            particle.vy *= 0.96;
            
            // 更新旋转
            particle.rotation += particle.rotationSpeed;
            
            // 更新透明度 - 使用缓动函数使淡出更平滑
            // 随着粒子速度降低，淡出也会变慢
            const speedFactor = Math.min(Math.sqrt(particle.vx*particle.vx + particle.vy*particle.vy) / explosionConfig.maxSpeed, 1);
            // 基础衰减率
            let baseDecay = 0.01 + Math.random() * 0.01;
            // 根据速度和动画进度调整衰减率
            particle.alpha -= baseDecay * (0.5 + speedFactor);
            // 确保alpha不小于0
            particle.alpha = Math.max(0, particle.alpha);
            
            // 绘制粒子
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            
            // 绘制圆形粒子
            ctx.beginPath();
            if (explosionConfig.useRadialGradient) {
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, particle.color.replace(')', ', 0)').replace('rgb', 'rgba').replace('hsl', 'hsla'));
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = particle.color;
            }
            ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
        
        // 继续动画或清理 - 只有当所有粒子都完全透明时才移除canvas
        if (progress < 1 || particles.some(p => p.alpha > 0)) {
            requestAnimationFrame(animate);
        } else {
            // 动画结束，移除canvas
            if (body.contains(canvas)) {
                body.removeChild(canvas);
            }
        }
    }
    
    // 开始动画
    requestAnimationFrame(animate);
}

// 更新拖尾元素位置
function updateTrailElements() {
    const now = Date.now();
    
    // 检测鼠标是否停止移动并触发爆炸效果
    checkMouseRest(now);
    
    // 遍历所有拖尾元素
    for (let i = trailElements.length - 1; i >= 0; i--) {
        const trail = trailElements[i];
        
        // 检查元素是否超过生命周期
        if (now - trail.createdAt > trailConfig.lifeSpan) {
            // 从DOM中移除并从数组中删除
            trail.element.remove();
            trailElements.splice(i, 1);
            continue;
        }
        
        // 使用缓动函数让拖尾元素平滑跟随目标位置
        trail.x += (trail.targetX - trail.x) * trailConfig.followSpeed;
        trail.y += (trail.targetY - trail.y) * trailConfig.followSpeed;
        
        // 更新元素位置
        trail.element.style.left = `${trail.x - trail.size/2}px`;
        trail.element.style.top = `${trail.y - trail.size/2}px`;
        
        // 计算并更新透明度（生命周期结束时淡出）
        const lifeProgress = (now - trail.createdAt) / trailConfig.lifeSpan;
        const opacity = 0.7 * (1 - lifeProgress);
        trail.element.style.opacity = opacity.toString();
    }
    
    // 持续更新动画
    requestAnimationFrame(updateTrailElements);
}

// 鼠标移动事件处理
function handleMouseMove(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // 更新最后移动时间和重置爆炸标记
    lastMovementTime = Date.now();
    hasExplodedAtRest = false;
    
    // 计算鼠标移动距离，只有当移动一定距离时才创建新的拖尾元素
    const distanceMoved = Math.sqrt(
        Math.pow(mouseX - lastMouseX, 2) + 
        Math.pow(mouseY - lastMouseY, 2)
    );
    
    // 只有当移动距离足够大或没有拖尾元素时创建新元素
    if (distanceMoved > 10 || trailElements.length === 0) {
        // 创建新的拖尾元素
        const trail = createTrailElement(mouseX, mouseY);
        trailElements.unshift(trail);
        
        // 更新最后鼠标位置
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        
        // 限制拖尾元素数量
        if (trailElements.length > trailConfig.trailCount) {
            const oldestTrail = trailElements.pop();
            oldestTrail.element.remove();
        }
    }
    
    // 更新所有拖尾元素的目标位置
    trailElements.forEach((trail, index) => {
        // 为不同位置的拖尾元素设置不同的目标位置，形成曲线效果
        if (index > 0) {
            trail.targetX = trailElements[index - 1].x;
            trail.targetY = trailElements[index - 1].y;
        } else {
            // 第一个元素始终指向鼠标位置
            trail.targetX = mouseX;
            trail.targetY = mouseY;
        }
    });
}

// 检测鼠标是否停止移动并触发爆炸效果
function checkMouseRest(now) {
    // 检查是否超过了停止检测时间阈值且尚未在当前位置爆炸
    if (now - lastMovementTime > trailConfig.mouseRestThreshold && !hasExplodedAtRest) {
        // 在鼠标停止位置创建爆炸效果
        createExplosion(lastMouseX, lastMouseY);
        // 标记已爆炸，防止重复触发
        hasExplodedAtRest = true;
    }
}

// 鼠标点击事件处理
function handleClick(event) {
    // 获取点击位置
    const x = event.clientX;
    const y = event.clientY;
    
    // 创建爆炸效果
    createExplosion(x, y);
}

// 触摸设备支持
function handleTouchStart(event) {
    event.preventDefault(); // 阻止默认行为，如页面滚动
    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    
    // 创建爆炸效果
    createExplosion(x, y);
}

// 初始化函数
function init() {
    // 添加鼠标移动事件监听器（拖尾效果）
    body.addEventListener('mousemove', handleMouseMove);
    
    // 添加鼠标点击事件监听器（爆炸效果）
    body.addEventListener('click', handleClick);
    
    // 添加触摸事件监听器，支持移动设备
    body.addEventListener('touchstart', handleTouchStart);
    
    // 启动拖尾动画循环
    requestAnimationFrame(updateTrailElements);
    
    // 初始化鼠标位置
    lastMouseX = window.innerWidth / 2;
    lastMouseY = window.innerHeight / 2;
    
    // 添加一些交互提示
    const container = document.querySelector('.container');
    
    // 只有当container元素存在时才设置样式
    if (container) {
        container.style.opacity = '0';
        
        // 页面加载后的淡入效果
        setTimeout(() => {
            container.style.transition = 'opacity 1s ease-out';
            container.style.opacity = '1';
        }, 500);
    }
}

// 更新下班倒计时
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    const now = new Date();
    const target = new Date();
    
    // 设置目标时间为今天的用户自定义下班时间
    target.setHours(workEndTime.hour, workEndTime.minute, 0, 0);
    
    // 如果当前时间已经过了下班时间，设置目标时间为明天的下班时间
    if (now > target) {
        target.setDate(target.getDate() + 1);
    }
    
    // 计算时间差（毫秒）
    const timeDiff = target - now;
    
    // 转换为小时、分钟、秒
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // 更新倒计时显示 - 分为两个部分以实现换行效果
    countdownElement.innerHTML = `
        <span class="countdown-text">距离下班还有</span>
        <span class="countdown-time">${hours}小时${minutes}分${seconds}秒</span>
    `;
}

// 初始化并启动倒计时
function initCountdown() {
    // 立即更新一次
    updateCountdown();
    
    // 每秒更新一次
    setInterval(updateCountdown, 1000);
}

// 初始化设置功能
function initSettings() {
    // 获取DOM元素
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeBtn = document.querySelector('.close');
    const saveBtn = document.getElementById('saveSettingsBtn');
    const hourSelect = document.getElementById('workEndHour');
    const minuteSelect = document.getElementById('workEndMinute');
    
    // 检查元素是否存在
    if (!settingsBtn || !settingsModal || !closeBtn || !saveBtn || !hourSelect || !minuteSelect) {
        console.error('设置相关DOM元素未找到');
        return;
    }
    
    // 生成小时选项（0-23）
    for (let i = 0; i <= 23; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i.toString().padStart(2, '0');
        hourSelect.appendChild(option);
    }
    
    // 生成分钟选项（0-59，每5分钟一个选项）
    for (let i = 0; i <= 59; i += 5) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i.toString().padStart(2, '0');
        minuteSelect.appendChild(option);
    }
    
    // 设置默认值
    hourSelect.value = workEndTime.hour;
    minuteSelect.value = workEndTime.minute;
    
    // 打开弹窗
    function openModal() {
        settingsModal.style.display = 'block';
        // 设置淡入动画
        setTimeout(() => {
            settingsModal.querySelector('.modal-content').style.opacity = '1';
        }, 10);
    }
    
    // 关闭弹窗
    function closeModal() {
        // 重置选择框为当前设置值
        hourSelect.value = workEndTime.hour;
        minuteSelect.value = workEndTime.minute;
        // 设置淡出动画
        const modalContent = settingsModal.querySelector('.modal-content');
        modalContent.style.opacity = '0';
        setTimeout(() => {
            settingsModal.style.display = 'none';
        }, 300);
    }
    
    // 保存设置
    function saveSettings() {
        const newHour = parseInt(hourSelect.value);
        const newMinute = parseInt(minuteSelect.value);
        
        // 更新下班时间设置
        workEndTime.hour = newHour;
        workEndTime.minute = newMinute;
        
        // 立即更新倒计时
        updateCountdown();
        
        // 关闭弹窗
        closeModal();
        
        // 添加保存成功的视觉反馈
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.style.animation = 'none';
            countdownElement.style.backgroundColor = 'rgba(34, 197, 94, 0.7)';
            setTimeout(() => {
                countdownElement.style.animation = '';
                setTimeout(() => {
                    countdownElement.style.backgroundColor = '';
                }, 1000);
            }, 500);
        }
    }
    
    // 添加事件监听器
    settingsBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', saveSettings);
    
    // 点击弹窗外部关闭弹窗
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            closeModal();
        }
    });
    
    // 按ESC键关闭弹窗
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && settingsModal.style.display === 'block') {
            closeModal();
        }
    });
}

// 扩展init函数，添加倒计时初始化
function initWithCountdown() {
    init();
    initCountdown();
    initSettings();
}

// 页面加载完成后初始化
window.addEventListener('load', initWithCountdown);