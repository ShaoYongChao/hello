// 变量初始化
var currentTouchF;
var forceConversions = [0.8, 1, 1.2];
var fcIndex = 1;
var maxForce = 6.666666667;
var tareForce = 0;
var currentTouch;
var updater = 0;
var numTouches = 0;
var touches = {};
var force = 0;

// 获取DOM元素
var tare, warning, weight, circle2, circle;
function getDOMElements() {
    tare = document.getElementById('tare');
    warning = document.getElementById('warning');
    weight = document.getElementById('weight');
    circle2 = document.getElementById('circle2');
    circle = document.getElementById('circle');
}

// 处理灵敏度设置
function setupSensitivity() {
    var senseElement = document.getElementById('sense');
    senseElement.onchange = function(e) {
        fcIndex = this.selectedIndex;
        document.cookie = "fc=" + fcIndex;
    };
    
    // 读取cookie设置
    var fcCookie = ('; ' + document.cookie).split('; fc=').pop().split(';').shift();
    fcIndex = fcCookie == "" ? fcIndex : +fcCookie;
    senseElement.selectedIndex = fcIndex;
}

// 去皮按钮动画
function setupTareButton() {
    function transformTare() {
        if (typeof currentTouchF == 'undefined') return;
        tare.style.webkitTransform = 'rotateX(' + currentTouchF.force * 60 + 'deg)';
    }
    
    setInterval(transformTare, 10);
    
    function tareTouchStart(e) {
        e.preventDefault();
        currentTouchF = e.touches[0];
        tareForce = e.touches[0].force;
    }
    
    tare.addEventListener('touchstart', tareTouchStart, false);
}

// 称重计算函数
function weigh(force) {
    var tare = force - tareForce;
    var grams = (tare * 405.257 * forceConversions[fcIndex] + 2.056 * forceConversions[fcIndex]);
    if (grams < 12) grams -= 2.056 * forceConversions[fcIndex];
    return grams.toFixed(2);
}

// 更新力的显示
function updateForce() {
    if (numTouches > 1) {
        warning.style.display = 'inline-block';
    } else {
        warning.style.display = 'none';
    }
    
    // 确保分母不为0
    var touchCount = numTouches || 1;
    
    circle2.style.height = ((force / touchCount) * 345) + 'px';
    circle2.style.width = ((force / touchCount) * 345) + 'px';
    
    document.getElementById('container').style.webkitTransform = 
        'rotateX(' + force / touchCount * -20 + 'deg) scale(' + (1 - (force / touchCount * 0.06)) + ')';
    
    var px = force / touchCount * 5 + 'px';
    if (force > 0) document.body.style.boxShadow = '0px 0px ' + ' 15px ' + px + ' rgba(0, 0, 0, 0.333) inset';
    
    weight.innerHTML = weigh(force) + 'g';
}

// 设置触摸事件监听
function setupTouchEvents() {
    function onForceStart(event) {
        currentTouch = event.touches[0];
        numTouches = event.touches.length;
    }
    
    function onForceMove(event) {
        event.preventDefault();
        currentTouch = event.touches[0];
        numTouches = event.touches.length;
    }
    
    function onForceEnded(event) {
        event.preventDefault();
        setTimeout(function() {
            currentTouch = undefined;
            force = 0;
            delete touches[event.changedTouches[0].identifier];
        }, 2);
        numTouches = event.touches.length;
    }
    
    function onForceChange(event) {
        event.preventDefault();
        currentTouch = event.changedTouches[0];
        force = 0;
        for (var i = 0; i < event.changedTouches.length; i++) 
            touches[event.changedTouches[i].identifier] = event.changedTouches[i].force;
        
        numTouches = Object.keys(touches).length;
        for (var k in touches) 
            if (touches.hasOwnProperty(k)) {
                force += touches[k];
            }
    }
    
    // 添加事件监听器
    circle.addEventListener('touchmove', onForceMove, false);
    circle.addEventListener('touchstart', onForceStart, false);
    circle.addEventListener('touchend', onForceEnded, false);
    circle.addEventListener('touchforcechange', onForceChange, false);
}

// 初始化函数
function init() {
    getDOMElements();
    setupSensitivity();
    setupTareButton();
    setupTouchEvents();
    
    // 开始更新循环
    setInterval(updateForce, 1);
}

// 页面加载完成后初始化
window.addEventListener('load', init);