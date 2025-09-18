
// 每次打开网页时，都会调用这个函数
export function getCount(insertdata) {
    // 从服务器/getCount接口获取数据
    //发送ajax请求
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/getCount');
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            // console.log(data);
            if (insertdata){
                insertdata(data.data);
            }
        }
    }
}

// 使用XMLHttpRequest向服务器 http://10.168.1.127:3000/addCount 发送请求，请求体为 {"username": "AASDSAD", "time": 1231412}
export function addCount(ip,address) {
    // 创建XMLHttpRequest对象
    var xhr = new XMLHttpRequest();
    // 设置请求方式
    xhr.open("POST", "http://localhost:3000/addCount");
    // 设置请求头
    xhr.setRequestHeader("Content-Type", "application/json");
    //通过https://api64.ipify.org?format=json  获取ip
    var timestamp = new Date().getTime();
    // console.log(timestamp);
    // 设置请求体
    var body = {
        ip: ip,
        address: address,
        time: timestamp
    };
    // 发送请求
    xhr.send(JSON.stringify(body));
}