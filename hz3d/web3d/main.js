import * as THREE from 'three';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import { FPCameraControls } from './jsm/controls/FPCameraControls.js';
import { TWEEN } from './jsm/libs/tween.module.min.js';
import { getCount, addCount } from './count.js';

import Stats from './jsm/libs/stats.module.js';

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

let maxFPS = 60;
let then = Date.now();
let scene, renderer;
let firstperson;
let gbscene;
let gbs = [];
let grs = [];

let blocker = document.getElementById('blocker');
let instructions = document.getElementById('instructions');
let stats = new Stats();

const tab = document.getElementById("tab");
const launch = document.getElementById('launch-video');
const launchVideo = document.getElementById('launch-video').getElementsByTagName('video')[0];

const popup = document.getElementById('popup');
// const bgmdiv = document.getElementById('bgm');
// bgmdiv.style.backgroundImage = "url('./images/bgm_on.png')";
// let audio = document.getElementById('music');
// let isplaying = true;
let tempName = "";

let pagedisplay = true;
let video = document.getElementById("video");
let videoPlaying = false;
let videoState = "image";

// 获取图片容器
const imageContainer = document.querySelector(".image-container");
const images = imageContainer.querySelectorAll("img");

imageContainer.style.display = "none";
// 监听所有的图片点击事件
imageContainer.addEventListener("click", (event) => {
    // 如果被点击的元素是图片，则切换选中状态，且取消其他所有图片的选中状态
    if (event.target.tagName === "IMG") {
        images.forEach((image) => {
            if (image !== event.target) {
                // 取消选中状态
                image.src = image.src.replace("_selected", "_unselected");
            }
        });
        // 更改event.target的src属性值
        event.target.src = event.target.src.replace("_unselected", "_selected");
        
        // 获取图片ID
        const imageId = parseInt(event.target.id);
        // console.log(imageId);
        setCamPos(imageId);
    }
});

var isDragging = false; // 标记当前元素是否正被拖拽
var startX, startY, translateX;

// 鼠标按下事件处理程序
imageContainer.addEventListener("touchstart", function (event) {
    isDragging = true; // 开始拖拽
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    translateX = Number(imageContainer.style.transform.replace(/[^\d.-]/g, ""));
    imageContainer.style.cursor = "grabbing";
});

// 鼠标移动事件处理程序
imageContainer.addEventListener("touchmove", function (event) {
    if (!isDragging) return; // 如果没有开始拖拽，直接退出

    var diff = event.touches[0].clientX - startX;
    var newX = translateX + diff;

    // 判断 newX 的范围
    if (newX > 0) {
        imageContainer.style.transform = `translateX(0px)`;
    } else if (Math.abs(newX) > imageContainer.clientWidth - window.innerWidth) {
        imageContainer.style.transform = `translateX(${-(
            imageContainer.clientWidth - window.innerWidth
        )}px)`;
    } else {
        imageContainer.style.transform = `translateX(${newX}px)`;
    }
    event.stopPropagation();
});

// 鼠标松开事件处理程序
imageContainer.addEventListener("touchup", function () {
    isDragging = false; // 结束拖拽
    imageContainer.style.cursor = "grab";
});


const camPos = [
    { position: new THREE.Vector3(2.308, 1.5, -1.174), lookAt: new THREE.Vector3(2.669, 1.562, -2.668) },
    { position: new THREE.Vector3(5.775, 1.5, -1.212), lookAt: new THREE.Vector3(2.741, -1.535, 2.742) },
    { position: new THREE.Vector3(7.069, 1.5, -4.16), lookAt: new THREE.Vector3(0.010, -0.030, 0.000) },
    { position: new THREE.Vector3(6.531, 1.5, -9.513), lookAt: new THREE.Vector3(-1.46, -1.503, -1.468) },
    { position: new THREE.Vector3(6.510, 1.5, -12.513), lookAt: new THREE.Vector3(-1.469, -1.503, -1.468) },
    { position: new THREE.Vector3(8.114, 1.5, -17.303), lookAt: new THREE.Vector3(-0.252, 1.386, 0.247) },
    { position: new THREE.Vector3(4.300, 1.5, -15.592), lookAt: new THREE.Vector3(2.350, -1.358, 2.362) },
    { position: new THREE.Vector3(0.439, 1.5, -16.856), lookAt: new THREE.Vector3(-2.823, 1.536, 2.824) },
    { position: new THREE.Vector3(1.091, 1.5, -8.929), lookAt: new THREE.Vector3(-2.458, 1.509, 2.460) },
    { position: new THREE.Vector3(4.071, 1.5, -9.589), lookAt: new THREE.Vector3(-3.113, 0.606, 3.126) },
    { position: new THREE.Vector3(1.647, 1.5, -12.512), lookAt: new THREE.Vector3(-0.066, -0.192, -0.012) }];

const bg = document.getElementById('bg');
bg.style.display = 'none';
const stateBtn = document.getElementById('stateBtn');
stateBtn.style.display = 'none';
let currentState = "3D";
stateBtn.addEventListener('click', function (event) {
    // 获取stateBtn 标签内的img
    let img = stateBtn.getElementsByTagName('img')[0];
    if (img.src.indexOf('image') > 0) {
        if (currentState == "3D") {
            img.src = './images/3DMY.png';
            currentState = "ZJLL";
            joystickBase.style.display = 'none';
            gbscene.visible = true;
            imageContainer.style.display = 'flex';
        }else{
            img.src = './images/ZJLL.png';
            currentState = "3D";
            joystickBase.style.display = 'block';
            gbscene.visible = false;
            imageContainer.style.display = 'none';
        }
    }
});

// const menu = document.getElementById('menu');
// const menulist = document.getElementById('menulist');
// let menushow = false;
// menulist.style.display = 'none';
// menu.style.display = 'none';

// menu.addEventListener('click', function (event) {
//     menulist.style.display = 'block';
//     bg.style.display = 'block';
//     menushow = true;
// });

// menulist.addEventListener('click', function (event) {
//     // 判断点击的y坐标 高度240 分8份 每份30
//     let y = event.clientY;
//     // Y坐标从上到下 0-240，Y向下偏移100
//     y = y - 100;

//     const onecell = 340 / 8;

//     let index = Math.floor(y / onecell);
//     // console.log(index);
//     setCamPos(index);
//     menulist.style.display = 'none';
//     bg.style.display = 'none';
//     menushow = false;
// });

bg.addEventListener('click', function (event){
    event.stopPropagation();
    // menulist.style.display = 'none';
    bg.style.display = 'none';
    // menushow = false;
});

bg.addEventListener('mousemove', function(event){
    event.stopPropagation();
});

bg.addEventListener('touchmove', function (event) {
    event.stopPropagation();
});

function checkbgm(){
    //判断popup是否显示
    if(popup.style.display == 'block'){
        return;
    }
    
    // if (isplaying) {
    //     audio.play();
    // } else {
    //     audio.pause();
    //     audio.currentTime = 0;
    // }
}

// 添加bgmdiv的点击事件
// bgmdiv.addEventListener('click', function () {
//     if (isplaying) {
//         audio.pause();
//         audio.currentTime = 0;
//         isplaying = false;
//         bgmdiv.style.backgroundImage = "url('./images/bgm_off.png')";
//     } else {
//         audio.play();
//         isplaying = true;
//         bgmdiv.style.backgroundImage = "url('./images/bgm_on.png')";
//     }
// });

stats.domElement.style.display = 'none';
stats.dom.style.opacity = 0.5;
stats.dom.style.transform = 'translate(-50%, 0)';
stats.dom.style.left = '50%';
stats.dom.style.top = '0px';

scene = new THREE.Scene();
// const SERVER_URL = isMobile() ? "http://www.mjexhibition.com/gltf/" : "http://www.mjexhibition.com/gltf_high/";
// const SERVER_URL = isMobile() ? "https://mjexhibition-1317720708.cos-website.ap-beijing.myqcloud.com/gltf/" : "https://mjexhibition-1317720708.cos-website.ap-beijing.myqcloud.com/gltf_high/";
const SERVER_URL = isMobile() ? "../gltf/" : "../gltf_high/";

const container = document.getElementById('page1');
document.body.appendChild(container);
container.appendChild(stats.dom);

document.body.style.overflow = 'hidden';
document.body.style["-webkit-user-select"] = 'none';
document.body.style["-user-select"] = 'none';

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // 0xffffff 是光的颜色，0.5 是光强度
scene.add(ambientLight);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

renderer.autoClear = true;
container.appendChild(renderer.domElement);
container.addEventListener('touchstart', function (event) {
    //判断多点触控
    if (event.touches.length >1){
        event.defaultPrevented();
    }
}, false);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 15);
// 摄像机初始位置
setCamPos(0);

firstperson = new FPCameraControls(camera, renderer.domElement);
firstperson.enabled = true;
firstperson.applyGravity = false;//重力
firstperson.applyCollision = true;
firstperson.positionEasing = false;////上下楼梯时逐步上升
firstperson.moveSpeed = 0.05;////上下楼梯时逐步上升


getIp();
let ip = '0.0.0.0';
let address = '未知';
//使用GET方法通过https://api64.ipify.org获取用户ip
function getIp() {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api64.ipify.org');
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                    // 通过https://gwgp-cekvddtwkob.n.bdcloudapi.com/ip/geo/v1/district?ip=获取用户地址
                    var xhr2 = new XMLHttpRequest();
                    xhr2.open('GET', 'https://gwgp-cekvddtwkob.n.bdcloudapi.com/ip/geo/v1/district?ip=' + xhr.responseText);
                    // xhr2.setRequestHeader('Content-Type', 'application/json');
                    // xhr2.setRequestHeader('X-Bce-Signature', 'bce-auth-v1/8e5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b/2020-12-01T08:00:00Z/1800/host/4b5c6d7e8f9a0a1b2c3d4e5f6g7h8i9j');
                    xhr2.send();
                    xhr2.onreadystatechange = function () {
                        if (xhr2.readyState === 4) {
                            if (xhr2.status === 200) {
                                address = JSON.parse(xhr2.responseText).data.prov;
                                // console.log(address);
                                ip = xhr.responseText;
                                addCount(ip, address);
                            }else{
                                // console.log(xhr2.status);
                                // console.log(xhr2.responseText);
                                addCount(ip, address);
                            }
                        }
                    }

                } else {
                    reject('获取ip失败');
                }

            }
        }
    })
}

// 获取id为visitor的元素
let visitor = document.getElementById('visitor');
// 设置元素的内容为visitorCount
getCount((data) => {
    visitor.innerText = data + "人来过";
});

// Create a manager to manager the element
var manager = new Hammer.Manager(visitor);

var DoubleTap = new Hammer.Tap({
  event: 'doubletap',
  taps: 3
});

manager.add(DoubleTap);
manager.on('doubletap', function(e) {
  var vConsole = new window.VConsole();
});

function onProgress(xhr) {
    if (xhr.lengthComputable) {
        let percentComplete = xhr.loaded / xhr.total * 100;
        instructions.children[0].innerText = '加载中...   ' + Math.round(percentComplete, 2) + '%';
        if (percentComplete === 100) {
            instructions.children[0].innerText = "正在渲染...\n\n请稍后...";
            showPopup();
            setTimeout(() => {
                instructions.style.display = 'none';
                blocker.style.display = 'none';
                if (isMobile()) {
                    stateBtn.style.display = 'block';
                    tab.style.display='block'
                }else{
                    imageContainer.display = 'none';
                }
                launch.style.display='none';
                launchVideo.pause();
                // 移除video标签
                // launch.removeChild(launchVideo);

                // 移除video-container
                // document.body.removeChild(launch);

                // menu.style.display = 'block';
            }, 8000);
        }
    }
}


let boxs = [];
// 创建BoxHelper
function createBoxHelper(center, size, color, boxName) {
    const box = new THREE.Box3();
    box.name = boxName;
    box.setFromCenterAndSize(center, size);
    boxs.push(box);
    // const boxHelper = new THREE.Box3Helper(box, color);
    // scene.add(boxHelper);
}

createBoxHelper(new THREE.Vector3(1.377, 0.0500, -3.114), new THREE.Vector3(6.4, 0.1, 6.8), 0xff0000, "box1");
createBoxHelper(new THREE.Vector3(6.593, 0.0500, -3.772), new THREE.Vector3(3.86, 0.1, 7.42), 0xffff00, "box2");
createBoxHelper(new THREE.Vector3(7.374, 0.0500, -13.349), new THREE.Vector3(2.48, 0.1, 11.64), 0x00ff00, "box3");
createBoxHelper(new THREE.Vector3(3.687, 0.0300, -10.745), new THREE.Vector3(4.90, 0.1, 6.80), 0x0000ff, "box4");
createBoxHelper(new THREE.Vector3(3.657, 0.0500, -16.395), new THREE.Vector3(4.56, 0.1, 4.44), 0x00ffff, "box5");
createBoxHelper(new THREE.Vector3(-0.271, 0.0500, -13.177), new THREE.Vector3(3.12, 0.1, 9.92), 0xff00ff, "box6");

//box1区域内灯光
const box1LightNames = ["Spot017", "Spot011", "Spot014", "Spot015", "Spot030", "Spot037"];
//box2区域内灯光
const box2LightNames = ["Spot036", "Spot033", "Spot024"];
//box3区域内灯光
const box3LightNames = ["Spot035", "Spot028", "Spot025", "Spot023", "Spot017", "Spot016"];
const lights = {
    p1: [],
    p2: [],
    p3: [],
};
// 加载FBX模型
const lightloader = new FBXLoader();
lightloader.load(SERVER_URL + "fbx/light.fbx", function (model) {
    // console.log(SERVER_URL);
    for (let index = 0; index < model.children.length; index++) {
        const obj3d = model.children[index];
        if (obj3d.type === "SpotLight") {
            // 判断灯光名称是否在box1LightNames内，如果在则添加到box1区域内灯光数组
            if (box1LightNames.includes(obj3d.name)) {
                lights.p1.push(obj3d);
            }
            if (box2LightNames.includes(obj3d.name)) {
                lights.p2.push(obj3d);
            }
            if (box3LightNames.includes(obj3d.name)) {
                lights.p3.push(obj3d);
            }

            // 灯光强度在当前值减半
            obj3d.intensity /= 2;

            if (obj3d.name.includes("33") || obj3d.name.includes("28")) {
                obj3d.intensity /= 6;
            }

            // 灯光距离
            obj3d.distance = 5;
            // 灯光目标点更新位置
            obj3d.target.updateMatrixWorld();
            obj3d.penumbra = 0.2; // 边缘
            obj3d.decay = 0.7;    // 衰减
            scene.add(obj3d);
        }
    };
    render();
});

const gbLoader = new GLTFLoader();
gbLoader.load(SERVER_URL + "coordinate/coordinate.gltf", function (model) {
    gbscene = model.scene;
    gbscene.visible = false;
    scene.add(model.scene);
    for (let index = 0; index < model.scene.children.length; index++) {
        const obj3d = model.scene.children[index].children[0];
        if (obj3d.name.indexOf("JT") != -1) {
            // console.log(obj3d.name);
            // 使用TWEEN，使obj3d上下移动
            new TWEEN.Tween(obj3d.position)
                .to({ y: 0.1 }, 1000)
                .repeat(Infinity)
                .yoyo(true)
                .start();
            gbs.push(obj3d);
        }
        if (obj3d.name.indexOf("G") != -1) {
            grs.push(obj3d);
        }
    }
    render();
});

//加载场景
const loader = new GLTFLoader();
const btnloader = new GLTFLoader();
const buttonNames = ["Button011", "Button042", "Button043", "Button044", "Button045"];
const dengpianName = "dengpian";
const h1Name = "h1";
const dimianName = "DIMIAN";
let buttons = [];
//box1区域内按钮
const box1ButtonNames = ["Button001", "Button041"];
//box2区域内按钮
const box2ButtonNames = ["Button000", "Button002", "Button003", "Button004", "Button005", "Button041"];
//box3区域内按钮
const box3ButtonNames = ["Button006", "Button007", "Button008", "Button009", "Button010", "Button012", "Button013", "Button014", "Button015", "Button016", "Button017"];
//box4区域内按钮
const box4ButtonNames = ["Button018", "Button040", "Button039", "Button038", "Button037", "Button036"];
//box5区域内按钮
const box5ButtonNames = ["Button019", "Button020", "Button021", "Button022", "Button023", "Button024", "Button025", "Button026"];
//box6区域内按钮
const box6ButtonNames = ["Button26", "Button027", "Button028", "Button029", "Button030", "Button031", "Button032", "Button033", "Button034", "Button035", "Button038", "Button037", "Button036"];
const btnNames = { "box1ButtonNames": box1ButtonNames, "box2ButtonNames": box2ButtonNames, "box3ButtonNames": box3ButtonNames, "box4ButtonNames": box4ButtonNames, "box5ButtonNames": box5ButtonNames, "box6ButtonNames": box6ButtonNames };
function scaleCube(obj) {
    const tween = new TWEEN.Tween(obj.scale)
        .to({ x: 0.0012, y: 0.0012, z: 0.0012 }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {
            const tweenOut = new TWEEN.Tween(obj.scale)
                .to({ x: 0.001, y: 0.001, z: 0.001 }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    scaleCube(obj);
                })
                .start();
        })
        .start();
}

let videoObj = null;
btnloader.load(SERVER_URL + 'button/button.gltf', function (gltf) {
    const gscene = gltf.scene;
    scene.add(gscene);
    for (const element of gscene.children) {
        const obj = element.children[0];
        if (obj) {
            const { name } = obj;

            //隐藏几个暂时无用的按钮
            if (name.includes("Button")) {
                if (buttonNames.includes(name)) {
                    obj.visible = false;
                } else {
                    obj.visible = false;
                    buttons.push(obj);
                    scaleCube(obj);
                    if (box1ButtonNames.includes(name)) {
                        obj.visible = true;
                    }
                }
            }
        }
    }
});

loader.load(SERVER_URL + 'Scenes/Scenes.gltf', function (gltf) {
    const gscene = gltf.scene;
    // const scene3d = gscene.children[0];

    for (const element of gscene.children) {
        const obj = element.children[0];
        if (obj) {
            const { name } = obj;
            
            if(name == "pm3"){
                videoObj = obj;
                changeTexutre("image");
            }

            if(name == "boli"){
                obj.visible = false;
            }

            if (name.includes(dengpianName) || name.includes(h1Name)) {
                obj.visible = false;
            }

            if (name === dimianName) {
                obj.receiveShadow = true;
                obj.castShadow = false;
            }
            if (name === "Q26") {
                obj.material.emissive.set(0xE7E7E7);
                obj.material.emissiveIntensity = 0.6;
            }
            
        }
    }

    scene.add(gscene);
    firstperson.colliders = gscene;
    render();
}, onProgress);

// loader.load(SERVER_URL + 'PM3/PM3.gltf', function (gltf) {
//     const gscene = gltf.scene;
//     for (const element of gscene.children) {
//         const obj = element.children[0];
//         if (obj.name == "PM3") {
//             videoObj = obj;
//             changeTexutre("image");
//         }
//     }
//     scene.add(gscene);
//     render();
// }, onProgress);


function changeTexutre(v){
    if(v == "video"){
        // console.log("video");
        
        //获取到video对象  1
        if (videoPlaying){ 
            // video.pause();
            // video.currentTime = 0;
            // videoPlaying = false;
            changeTexutre("image")
        }else{
            video.play();
            videoPlaying = true;
            //通过video对象实例化纹理
            var texture_movie = new THREE.VideoTexture(video)
            texture_movie.flipY = false;
            texture_movie.wrapS = texture_movie.wrapT = THREE.ClampToEdgeWrapping;
            // texture_movie.minFilter = THREE.LinearFilter;
            videoObj.material = new THREE.MeshLambertMaterial({ map: texture_movie });
            // material.map.flipY = false;
        // videoObj.disHit = true;
        }
        
    }else{
        if (video && videoPlaying) {
            video.pause();
            video.currentTime = 0;
            videoPlaying = false;
        }
        //修改贴图
        var texture_a = new THREE.TextureLoader().load('./video.jpeg');
        texture_a.flipY = false;
        // 贴图自动缩放至与几何体同等大小
        texture_a.wrapS = texture_a.wrapT = THREE.ClampToEdgeWrapping
        texture_a.repeat.set(1, 1);
        videoObj.material = new THREE.MeshLambertMaterial({
            map: texture_a
        });
        // console.log("image");
        videoPlaying = false;
    }
}

loader.load(SERVER_URL + 'BT1/BT1.gltf', function (gltf) {
    const gscene = gltf.scene;
    scene.add(gscene);
    render();
}, onProgress);

const loaderZP = new GLTFLoader();
//子对象数组
let zpChildren = [];
// box1范围内展品
const zppart1Names = ["ZP0", "ZP1", "MP1"];
// box2范围内展品
const zppart2Names = ["ZP0", "ZP2", "MP2"];
// box3范围内展品
const zppart3Names = ["ZP3", "ZP4", "ZP39_3", "ZP39_2", "ZP4","ZP4a_3", "ZP5", "MP3", "MP4", "MP5"];
// box4范围内展品
const zppart4Names = ["ZP10", "MP10"];
// box5范围内展品
const zppart5Names = ["ZP6", "ZP7", "ZP53", "ZP6a","MP6", "MP7"];
// box6范围内展品
const zppart6Names = ["ZP8", "ZP10", "MP8"];
const zpNames = { "zppart1Names": zppart1Names, "zppart2Names": zppart2Names, "zppart3Names": zppart3Names, "zppart4Names": zppart4Names, "zppart5Names": zppart5Names, "zppart6Names": zppart6Names };
//加载展品
loaderZP.load(SERVER_URL + 'Exhibits/Exhibits.gltf', function (gltf) {
    //遍历所有的子对象
    gltf.scene.traverse(function (child) {
        //判断是否是Mesh对象
        if (child instanceof THREE.Mesh) {
            //将所有的Mesh对象添加到数组中
            zpChildren.push(child);
            //隐藏所有的Mesh对象
            child.visible = false;
        }
    });

    //遍历子对象数组
    for (let index = 0; index < zpChildren.length; index++) {
        const element = zpChildren[index];
        //判断是否是需要显示的对象
        if (zppart1Names.includes(element.name)) {
            //显示需要显示的对象
            element.visible = true;
        }
    }
    //delay 10s
    setTimeout(() => {
        scene.add(gltf.scene);
    }, 10000);
    // scene.add(gltf.scene);
});

// const loaderD = new GLTFLoader();
// loaderD.load(SERVER_URL + 'dengpian.gltf', function (gltf) {
//     setTimeout(() => {
//         scene.add(gltf.scene);
//     }, 5000);
// });

function setCamPos(index) {
    if (index >= camPos.length) return;
    let pos = camPos[index].position;
    let rot = camPos[index].lookAt;
    camera.position.set(pos.x, pos.y, pos.z);
    camera.rotation.set(rot.x, rot.y, rot.z);
    
    camera.updateProjectionMatrix();
    // camera.updateMatrixWorld();
    // camera.updateMatrix();
    // camera.updateWorldMatrix();
    if (firstperson && firstperson != null) {
        firstperson.updatecam(camera);
    }
    if (gbs && gbs.length == 0) return;
    gbs.forEach(element => {
        element.visible = true;
    }
    );
    grs.forEach(element => {
        element.visible = true;
    }
    );

    const element = gbs[index];
    element.visible = false;
    const elementr = grs[index];
    elementr.visible = false;
    
}


//延时设置摄像机far
setTimeout(() => {
    camera.far = 35;
    camera.updateProjectionMatrix(); // 更新投影矩阵，使修改生效
}, 15000);

// 创建虚拟摇杆
const joystickBase = document.createElement('div');
joystickBase.id = "joystickBase";
joystickBase.style.cssText = 'position: absolute; bottom: 12%; left: 6%; width: 150px; height: 150px;';
const joystickHead = document.createElement('div');
joystickHead.id = "joystickHead";
joystickHead.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 50px; height: 50px;';
const baseImg = document.createElement('img');
baseImg.id = "joystickBaseIMG";
baseImg.src = "./SVG/大圆.svg";
const headImg = document.createElement('img');
headImg.id = "joystickHeadIMG";
headImg.src = "./SVG/圆心.svg";
joystickHead.appendChild(headImg);
joystickBase.appendChild(baseImg);
joystickBase.appendChild(joystickHead);
firstperson.setJoystick(joystickBase, joystickHead);
// 将虚拟摇杆添加到页面中
document.body.appendChild(joystickBase);
//点选场景
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('pointerdown', onPointerDown);

const visitorDiv = document.getElementById("visitor");
visitorDiv.style.display = "block";
// bgmdiv.style.display = "block";

function checkPlayVideo(box) {
    if (box != "box4" && box != "box6") {
        if(videoPlaying){
            changeTexutre("image");
        }
    }
}

function onPointerDown(event) {
    // if (menushow) return;
    const { clientX, clientY } = event;
    const { innerWidth, innerHeight } = window;
    const isOverLimit = clientY > 0.8 * innerHeight;
    if (isOverLimit) return;

    const mouse = new THREE.Vector2(
        (clientX / innerWidth) * 2 - 1,
        -(clientY / innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length <= 0) return;

    const object = intersects[0].object;
    // console.log("click:", object.name);
    if (object.name === "pm3"){
        // 检查当前所在box
        const box = getCameraBoxName();
        // console.log("box:", box);
        if (box === "box4" || box === "box6"){
            changeTexutre("video");
        }
    }

    // 遍历gbs数组
    for (let index = 0; index < gbs.length; index++) {
        const element = gbs[index];
        // 判断是否是当前点击的对象
        if (element.name === object.name) {
            // console.log("click:", element.name);
            // element.name截取后面的数字
            const indexName = parseInt(element.name.split("T")[1]);
            // indexName转换为数字
            // console.log("indexName:", indexName);
            // 设置摄像机位置
            setCamPos(indexName);
            let menuCard = document.getElementById(indexName);
            //TODO
            images.forEach((image) => {
                if (image !== event.target) {
                    // 取消选中状态
                    image.src = image.src.replace("_selected", "_unselected");
                }
                menuCard.src.replace("_unselected", "_selected");

            });
        }
    }
    
    for (let index = 0; index < grs.length; index++) {
        const element = grs[index];
        // 判断是否是当前点击的对象
        if (element.name === object.name) {
            // console.log("click:", element.name);
            // element.name截取后面的数字
            const indexName = parseInt(element.name.split("R")[1]);
            // indexName转换为数字
            console.log("indexName:", indexName);
            // 设置摄像机位置
            setCamPos(indexName);
        }
    }

    if (buttonNames.includes(object.name) || object.name.indexOf("Button") === -1) return;

    // menulist.style.display = 'none';
    bg.style.display = 'none';
    // menu.style.display = 'none';
    imageContainer.style.display = "none";

    joystickBase.style.display = "none";
    visitorDiv.style.display = "none";
    // bgmdiv.style.display = "none";
    const indexName = object.name.split("n")[1];

    const close = document.createElement('div');
    close.id = "close";
    close.style.position = 'absolute';
    close.style.transform = 'translate(50%, 0)';
    close.style.top = '10px';
    close.style.left = '0px';
    close.style.zIndex = '111';

    //add close button event
    const closeImg = document.createElement('img');
    closeImg.id = "closeIMG";
    closeImg.src = "./SVG/返回.svg";
    closeImg.style.width = '30px';
    closeImg.style.height = '30px';
    closeImg.addEventListener('pointerdown', function () {
        iframe.style.display = "none";
        //判断是否是手机
        if(isMobile()){
            if (currentState == "3D") {
                joystickBase.style.display = 'block';
                imageContainer.style.display = "none";
            }else{
                joystickBase.style.display = 'none';
                imageContainer.style.display = "flex";
            }
            
        }else{
            joystickBase.style.display = "none";
            imageContainer.style.display = "none";
        }

        // menu.style.display = 'block';

        visitorDiv.style.display = "block";
        // bgmdiv.style.display = "block";
        document.body.removeChild(close);
        iframe.parentNode.removeChild(iframe);
    });
    close.appendChild(closeImg);
    document.body.appendChild(close);

    //添加iframe
    const iframe = document.createElement('iframe');
    iframe.id = "zhanpin";
    iframe.style.display = "block";
    iframe.src = `../zhanpin/${indexName}/index.html`;
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.border = 'none';
    iframe.style.zIndex = '100';
    iframe.style.backgroundColor = 'rgba(0,0,0,0.5)';
    document.body.appendChild(iframe);
}

window.addEventListener('resize', onWindowResize);

// 窗口大小改变时，重新设置相机和渲染器的大小
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

//判断摄像机在哪个box内，不考虑Y轴，返回box的name
function getCameraBoxName() {
    let cameraBoxName = '';
    let cameraPosition = camera.position;
    let cameraBox = new THREE.Box3();
    cameraBox.setFromCenterAndSize(new THREE.Vector3(cameraPosition.x, 0, cameraPosition.z), new THREE.Vector3(0.1, 0.1, 0.1));
    //遍历boxs，检查摄像机在哪个box内
    for (let index = 0; index < boxs.length; index++) {
        const box = boxs[index];
        if (box.intersectsBox(cameraBox)) {
            cameraBoxName = box.name;
            break;
        }
    }
    return cameraBoxName;
}

function showRoom(index) {
    buttons.forEach((item) => {
        item.visible = btnNames["box" + index + "ButtonNames"].includes(item.name);
    });
    zpChildren.forEach((item) => {
        item.visible = zpNames["zppart" + index + "Names"].includes(item.name);
    });
    lights.p3.forEach((item) => {
        item.visible = index > 3;
    });
    lights.p2.forEach((item) => {
        item.visible = index == 3;
    });
    lights.p1.forEach((item) => {
        item.visible = index < 3;
    });
    lights.p3.forEach((item) => {
        item.visible = index > 3;
    });
}

// 渲染循环
function render() {
    requestAnimationFrame(render);

    TWEEN.update();

    // 判断当前场景是否是展厅
    if (document.getElementsByClassName("tablinks")[0].classList.value.indexOf("active") != -1 && pagedisplay == false) {
        pagedisplay = true;
        if(isMobile()){
            joystickBase.style.display = "block";
        }else{
            joystickBase.style.display = "none";
        }
        // checkbgm();
    } else {
        pagedisplay = false;

        joystickBase.style.display = "none";
    }

    // 计算摄像头位置和朝向
    let vector = new THREE.Vector3();
    camera.getWorldPosition(vector);
    for (let index = 0; index < buttons.length; index++) {
        const btn = buttons[index];
        btn.lookAt(vector);
    }
    for (let gbidx = 0; gbidx < gbs.length; gbidx++){
        const gb = gbs[gbidx];
        gb.lookAt(vector);
    }

    if (currentState == "3D" && isMobile()) {
        joystickBase.style.display = 'block';
    } else if (currentState == "ZJLL" && isMobile()) {
        joystickBase.style.display = 'none';
    }
    //判断摄像机在哪个box内，返回box的name，相同box内不重复执行
    let cameraBoxName = getCameraBoxName();
    checkPlayVideo(cameraBoxName)
    if (cameraBoxName != tempName) {
        tempName = cameraBoxName;
        let currentPart = cameraBoxName.substr(3, 1);
        // console.log("当前部分：", currentPart);
        // console.log("当前box：", cameraBoxName);
        // currentPart 转换为数字
        currentPart = parseInt(currentPart);
        showRoom(currentPart);
    }

    // 控制帧数
    let now = Date.now();
    let interval = 1000 / maxFPS;
    let delta = now - then;

    if (delta > interval) {
        then = now - (delta % interval);
        // Update and render the scene here
        firstperson.update();
        renderer.render(scene, camera);
        stats.update();
    }
}
// 按下 F 键，打印相机位置和朝向
document.addEventListener('keydown', function (event) {
    if (event.keyCode == 70) {
        //添加弹窗，显示摄像机位置，位置信息可复制
        let cameraPosition = camera.position;
        let cameraPositionX = cameraPosition.x;
        let cameraPositionY = cameraPosition.y;
        let cameraPositionZ = cameraPosition.z;
        let cameraPositionStr = "摄像机位置：X:" + cameraPositionX + " Y:" + cameraPositionY + " Z:" + cameraPositionZ;

        let cameraRotation = camera.rotation;
        let cameraRotationX = cameraRotation.x;
        let cameraRotationY = cameraRotation.y;
        let cameraRotationZ = cameraRotation.z;
        let cameraRotationStr = "摄像机旋转角度：X:" + cameraRotationX + " Y:" + cameraRotationY + " Z:" + cameraRotationZ;
        console.log(cameraPositionStr + "\n" + cameraRotationStr);
        // alert(cameraPositionStr + cameraRotationStr);
    }
    //如果按下了V键，显示stats，如果显示了，再按一次，隐藏stats
    if (event.keyCode == 86) {
        if (stats.domElement.style.display == "block") {
            stats.domElement.style.display = "none";
        } else {
            stats.domElement.style.display = "block";
        }
    }
});

// 检测屏幕方向
window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", orientationChange, false);

//判断是否为移动端
function isMobile() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = false;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = true;
            window.createImageBitmap = undefined;
            break;
        }
    }

    return flag;
}
checkTabandJoy();
function checkTabandJoy() {
    
    const joystickBase = document.getElementById("joystickBase");
    if (isMobile()) {
        joystickBase.style.display = "block";
    } else {
        tab.style.cssText = "display:none;visibility:hidden;opacity:0;z-index:-1;pointer-events:none;transition:all 0.5s;";
        joystickBase.style.display = "none";
        stateBtn.style.display = 'none';
        try{
            gbscene.visible = false;
            imageContainer.style.display = 'none';
        }catch(e){}
        
    }
}

function orientationChange() {
    if (!isMobile()) return;
    
    if (window.orientation == 90 || window.orientation == -90) {
        tab.style.cssText = "display:none;visibility:hidden;opacity:0;z-index:-1;pointer-events:none;transition:all 0.5s;";
    } else {
        tab.style.cssText = "display:block;visibility:visible;opacity:1;z-index:1;pointer-events:auto;transition:all 0.5s;";
    }
    onWindowResize()
}

