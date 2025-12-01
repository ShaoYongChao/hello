// 扩展前缀列表（按类别分组）
const prefixes = {
    // 情感类
    emotion: [
        "愤怒的", "暴躁的", "快乐的", "悲伤的", "忧郁的", "兴奋的", 
        "沮丧的", "焦虑的", "平静的", "激动的", "冷漠的", "热情的",
        "狂野的", "温柔的", "害羞的", "自信的", "胆怯的", "傲慢的"
    ],
    
    // 性格特征类
    personality: [
        "勇敢的", "狡猾的", "智慧的", "神秘的", "孤独的", "冷静的",
        "疯狂的", "优雅的", "强大的", "弱小的", "古老的", "年轻的",
        "沉默的", "喧闹的", "机智的", "憨厚的", "敏捷的", "迟钝的"
    ],
    
    // 哲学思想类
    philosophy: [
        "唯物主义", "唯心主义", "存在主义", "实用主义", "理性主义", 
        "经验主义", "浪漫主义", "现实主义", "理想主义", "虚无主义",
        "个人主义", "集体主义", "自由主义", "保守主义", "激进主义"
    ],
    
    // 颜色类
    color: [
        "红色的", "橙色的", "黄色的", "绿色的", "蓝色的", "紫色的",
        "黑色的", "白色的", "灰色的", "金色的", "银色的", "透明的"
    ],
    
    // 元素类
    element: [
        "火焰般的", "水流般的", "大地般的", "风暴般的", "雷电般的",
        "冰霜般的", "光明的", "黑暗的", "星辰般的", "月光般的"
    ]
};

// 扩展后缀列表（按类别分组）
const suffixes = {
    // 职业类
    profession: [
        "魔法师", "战士", "弓箭手", "骑士", "盗贼", "牧师", "法师",
        "龙", "凤凰", "独角兽", "机器人", "外星人", "忍者", "海盗",
        "猎人", "德鲁伊", "萨满", "术士", "工程师", "医生", "教师",
        "厨师", "艺术家", "音乐家", "作家", "演员", "程序员"
    ],
    
    // 食品类
    food: [
        "土豆", "地瓜", "胡萝卜", "西红柿", "黄瓜", "洋葱", "大蒜",
        "苹果", "香蕉", "橙子", "葡萄", "草莓", "西瓜", "哈密瓜",
        "米饭", "面条", "面包", "牛奶", "矿泉水", "可乐", "啤酒",
        "咖啡", "茶叶", "巧克力", "饼干", "蛋糕", "冰淇淋"
    ],
    
    // 动物类
    animal: [
        "狮子", "老虎", "豹子", "狼", "狐狸", "熊", "大象", "犀牛",
        "猴子", "猩猩", "熊猫", "猫", "狗", "兔子", "老鼠", "蛇",
        "鹰", " owl", "乌鸦", "鹦鹉", "企鹅", "海豚", "鲸鱼", "鲨鱼"
    ],
    
    // 物品类
    object: [
        "宝剑", "盾牌", "魔法杖", "弓箭", "盔甲", "戒指", "项链",
        "宝石", "水晶", "钥匙", "书籍", "地图", "灯笼", "背包",
        "手机", "电脑", "耳机", "键盘", "鼠标", "汽车", "飞机", "火箭"
    ]
};

// 获取DOM元素
const nicknameElement = document.getElementById('nickname');
const loadingElement = document.getElementById('loading');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');

// 获取所有前缀词汇
function getAllPrefixes() {
    let allPrefixes = [];
    for (let category in prefixes) {
        allPrefixes = allPrefixes.concat(prefixes[category]);
    }
    return allPrefixes;
}

// 获取所有后缀词汇
function getAllSuffixes() {
    let allSuffixes = [];
    for (let category in suffixes) {
        allSuffixes = allSuffixes.concat(suffixes[category]);
    }
    return allSuffixes;
}

// 生成随机昵称函数
function generateNickname() {
    // 显示加载动画
    nicknameElement.classList.add('hidden');
    loadingElement.classList.remove('hidden');
    
    // 模拟网络延迟，增加真实感
    setTimeout(() => {
        const allPrefixes = getAllPrefixes();
        const allSuffixes = getAllSuffixes();
        
        const randomPrefix = allPrefixes[Math.floor(Math.random() * allPrefixes.length)];
        const randomSuffix = allSuffixes[Math.floor(Math.random() * allSuffixes.length)];
        const newNickname = randomPrefix + randomSuffix;
        
        // 更新昵称显示
        nicknameElement.textContent = newNickname;
        
        // 隐藏加载动画，显示昵称
        loadingElement.classList.add('hidden');
        nicknameElement.classList.remove('hidden');
    }, 800);
}

// 复制昵称到剪贴板函数
function copyToClipboard() {
    const nicknameText = nicknameElement.textContent;
    
    if (nicknameText && nicknameText !== "点击按钮生成昵称") {
        navigator.clipboard.writeText(nicknameText).then(() => {
            // 复制成功提示
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "已复制!";
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('复制失败: ', err);
            alert("复制失败，请手动复制");
        });
    } else {
        alert("请先生成一个昵称");
    }
}

// 添加事件监听器
generateBtn.addEventListener('click', generateNickname);
copyBtn.addEventListener('click', copyToClipboard);

// 页面加载完成后生成第一个昵称
document.addEventListener('DOMContentLoaded', () => {
    generateNickname();
});