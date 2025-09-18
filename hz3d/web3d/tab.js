// Open the default tab on page load
document.getElementById("page1").style.display = "block";
document.getElementsByClassName("tablinks")[0].classList.add("active");

// Function to open the selected tab
function openTab(evt, tabName) {
    // Declare variables
    let i, tabcontent, tablinks;

    // Hide all tab content
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove the "active" class from all tab buttons
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show the selected tab content and mark the button as active
    document.getElementById(tabName).style.display = "block";
    // let audio = document.getElementById('music');
    if(tabName != "page1"){
        // audio.pause();
        // audio.currentTime = 0;
        document.getElementById("joystickBase").style.display = "none";
        document.getElementById("page1").style.display = "none";
    }else{
        document.getElementById("joystickBase").style.display = "block";
        document.getElementById("page1").style.display = "block";
        // audio.play();
    }
    if(tabName == "page3"){
        window.location ="https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI0MzIwMjc4Ng==";
    }
    if (tabName == "page4") {
        window.location = "http://10.168.1.103/hz3d/web3d/chat.html";
    }
    evt.currentTarget.classList.add("active");
}