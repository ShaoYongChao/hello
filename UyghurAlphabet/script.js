// 维吾尔语字母表数据（32个字母）
const uyghurAlphabet = [
    { id: 1, ufy: 'ئا', uly: 'a', ipa: 'a' },
    { id: 2, ufy: 'ئە', uly: 'e', ipa: 'ɛ' },
    { id: 3, ufy: 'ب', uly: 'b', ipa: 'b' },
    { id: 4, ufy: 'پ', uly: 'p', ipa: 'p' },
    { id: 5, ufy: 'ت', uly: 't', ipa: 't' },
    { id: 6, ufy: 'ج', uly: 'j', ipa: 'dʒ' },
    { id: 7, ufy: 'چ', uly: 'ch', ipa: 'tʃ' },
    { id: 8, ufy: 'خ', uly: 'x', ipa: 'χ' },
    { id: 9, ufy: 'د', uly: 'd', ipa: 'd' },
    { id: 10, ufy: 'ر', uly: 'r', ipa: 'r' },
    { id: 11, ufy: 'ز', uly: 'z', ipa: 'z' },
    { id: 12, ufy: 'ژ', uly: 'zh', ipa: 'ʒ' },
    { id: 13, ufy: 'س', uly: 's', ipa: 's' },
    { id: 14, ufy: 'ش', uly: 'sh', ipa: 'ʃ' },
    { id: 15, ufy: 'غ', uly: 'gh', ipa: 'ʁ' },
    { id: 16, ufy: 'ف', uly: 'f', ipa: 'f' },
    { id: 17, ufy: 'ق', uly: 'q', ipa: 'q' },
    { id: 18, ufy: 'ك', uly: 'k', ipa: 'k' },
    { id: 19, ufy: 'گ', uly: 'g', ipa: 'g' },
    { id: 20, ufy: 'ڭ', uly: 'ng', ipa: 'ŋ' },
    { id: 21, ufy: 'ل', uly: 'l', ipa: 'l' },
    { id: 22, ufy: 'م', uly: 'm', ipa: 'm' },
    { id: 23, ufy: 'ن', uly: 'n', ipa: 'n' },
    { id: 24, ufy: 'ھ', uly: 'h', ipa: 'h' },
    { id: 25, ufy: 'ئو', uly: 'o', ipa: 'o' },
    { id: 26, ufy: 'ئۇ', uly: 'u', ipa: 'u' },
    { id: 27, ufy: 'ئۆ', uly: 'ö', ipa: 'ø' },
    { id: 28, ufy: 'ئۈ', uly: 'ü', ipa: 'y' },
    { id: 29, ufy: 'ۋ', uly: 'w', ipa: 'w' },
    { id: 30, ufy: 'ئې', uly: 'ë', ipa: 'e' },
    { id: 31, ufy: 'ئى', uly: 'i', ipa: 'i' },
    { id: 32, ufy: 'ي', uly: 'y', ipa: 'j' }
];

// 创建字母卡片的HTML
function createLetterCard(letter) {
    const card = document.createElement('div');
    card.className = 'letter-card';
    card.style.animationDelay = `${letter.id * 0.05}s`;
    
    card.innerHTML = `
        <div class="letter-number">
            <span class="cn-text">字母 ${letter.id}</span>
            <span class="uy-text" style="font-family: 'BTT', serif; direction: rtl; font-size: 0.85rem; color: #95a5a6;">ھەرپ ${letter.id}</span>
        </div>
        <div class="letter-ufy">${letter.ufy}</div>
        <div class="letter-info">
            <div class="info-row">
                <span class="info-label">
                    <span class="cn-text">拉丁转写</span>
                    <span class="uy-text" style="font-family: 'BTT', serif; direction: rtl; font-size: 0.75rem;">لاتىن يېزىقى</span>
                </span>
                <span class="info-value">${letter.uly}</span>
            </div>
            <div class="info-row">
                <span class="info-label">
                    <span class="cn-text">国际音标</span>
                    <span class="uy-text" style="font-family: 'BTT', serif; direction: rtl; font-size: 0.75rem;">خەلقئارا ئاۋاز</span>
                </span>
                <span class="info-value">[${letter.ipa}]</span>
            </div>
        </div>
        <button class="play-button" onclick="playSound(${letter.id})">
            <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <span class="cn-text">发音</span>
            <span class="uy-text" style="font-family: 'BTT', serif; direction: rtl; font-size: 0.9rem;">تەلەپپۇز</span>
        </button>
    `;
    
    return card;
}

// 音频缓存对象
const audioCache = {};

// 预加载音频文件
function preloadAudio(id) {
    if (!audioCache[id]) {
        const audio = new Audio(`sound/${id}.wav`);
        audio.preload = 'auto';
        audioCache[id] = audio;
    }
    return audioCache[id];
}

// 播放音频
function playSound(id) {
    // 获取或创建音频对象
    let audio = audioCache[id];
    
    if (!audio) {
        audio = new Audio(`sound/${id}.wav`);
        audio.preload = 'auto';
        audioCache[id] = audio;
    }
    
    // 重置音频到开始位置
    audio.currentTime = 0;
    
    // 添加错误处理
    audio.onerror = function() {
        console.error(`无法加载音频文件: sound/${id}.wav`);
        alert(`抱歉，无法播放音频文件 ${id}.wav`);
    };
    
    // 播放音频
    audio.play().catch(error => {
        console.error('播放音频时出错:', error);
        alert('播放音频时出错，请检查音频文件是否存在。');
    });
    
    // 添加视觉反馈
    const button = event.target.closest('.play-button');
    if (button) {
        button.style.opacity = '0.7';
        setTimeout(() => {
            button.style.opacity = '1';
        }, 200);
    }
}

// 初始化页面
function initializePage() {
    const alphabetGrid = document.getElementById('alphabet-grid');
    
    // 生成所有字母卡片
    uyghurAlphabet.forEach(letter => {
        const card = createLetterCard(letter);
        alphabetGrid.appendChild(card);
    });
}

// 平滑滚动功能
function setupSmoothScroll() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // 只对锚点链接进行平滑滚动
            if (href.startsWith('#')) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // 更新活动链接
                    document.querySelectorAll('.nav-link').forEach(l => {
                        l.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            }
        });
    });
}

// 滚动时更新导航栏活动状态
function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupSmoothScroll();
    setupScrollSpy();
    setupUyghurToggle();
    
    // 预加载所有音频文件
    uyghurAlphabet.forEach(letter => {
        preloadAudio(letter.id);
    });
    
    console.log('维吾尔语字母表学习平台已加载完成！');
    console.log(`共加载 ${uyghurAlphabet.length} 个字母`);
    console.log('音频文件正在预加载...');
});

// 设置维语显示切换功能
function setupUyghurToggle() {
    const toggleBtn = document.getElementById('toggleUyghur');
    const toggleText = document.getElementById('toggleText');
    let isUyghurVisible = false; // 默认不显示
    
    // 从localStorage读取用户偏好设置
    const savedPreference = localStorage.getItem('showUyghur');
    if (savedPreference === 'true') {
        isUyghurVisible = true;
        document.body.classList.add('show-uyghur');
        toggleText.textContent = '隐藏维语';
    }
    
    toggleBtn.addEventListener('click', function() {
        isUyghurVisible = !isUyghurVisible;
        
        if (isUyghurVisible) {
            document.body.classList.add('show-uyghur');
            toggleText.textContent = '隐藏维语';
            localStorage.setItem('showUyghur', 'true');
        } else {
            document.body.classList.remove('show-uyghur');
            toggleText.textContent = '显示维语';
            localStorage.setItem('showUyghur', 'false');
        }
    });
}

// 键盘快捷键支持（可选功能）
document.addEventListener('keydown', function(e) {
    // 按数字键1-9播放对应字母发音
    if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.altKey) {
        const id = parseInt(e.key);
        if (id <= uyghurAlphabet.length) {
            playSound(id);
        }
    }
});
