//SETTINGS CONTROL
function openSettings(){
    var settingsModal = document.getElementsByClassName('settings-modal')[0];
    settingsModal.style.display = 'inline';
    var settingsButton = document.getElementsByClassName('settings-button')[0].getElementsByTagName('button')[0];
    settingsButton.classList.add("disabled");
}
window.openSettings = openSettings;

function closeSettings(){
    var settingsModal = document.getElementsByClassName('settings-modal')[0];
    settingsModal.style.display = 'none';
    var settingsButton = document.getElementsByClassName('settings-button')[0].getElementsByTagName('button')[0];
    settingsButton.classList.remove("disabled");
    loadUserData();
    applyUserData();
}
window.closeSettings = closeSettings;

//LOADING USER DATA
export function setDefault(){
    window.userData.fontSize = "100%";
    window.userData.textColor = "#212529";
    window.userData.UIColor = "#ffffff";
    window.userData.rightKey = 39;
    window.userData.rightKeyName = "ArrowRight";
    window.userData.leftKey = 37;
    window.userData.leftKeyName = "ArrowLeft";
}

export function loadUserData(){
    window.userData = JSON.parse(localStorage.getItem('userData'));
    console.log("loaded: ", window.userData);
}

export function applyUserData(){
    document.getElementsByTagName("html")[0].style.setProperty("font-size", window.userData.fontSize);
    
    document.getElementsByTagName("body")[0].style.color = window.userData.textColor;
    document.getElementById("textColorInput").value = window.userData.textColor;

    document.getElementById("UIColorInput").value = window.userData.UIColor;
    var bgColorElements = document.getElementsByClassName('bg-color');
    for(var element of bgColorElements){
        element.style.backgroundColor = window.userData.UIColor;
    }

    var buttonRightInput = document.getElementById("buttonRightInput"); 
    buttonRightInput.value = window.userData.rightKeyName;
    var buttonLeftInput = document.getElementById("buttonLeftInput");
    buttonLeftInput.value = window.userData.leftKeyName;
}

function resetOptions(){
    setDefault();
    applyUserData();
    localStorage.setItem("userData", JSON.stringify(window.userData));
}
window.resetOptions = resetOptions;


//SETTINGS CHANGES
function increaseTextSize() {
    var html = document.getElementsByTagName("html")[0];
    var fontSize = html.style.fontSize;
    var newfontSizeString = (parseInt(fontSize) + 10).toString();
    var newFontSize = newfontSizeString + "%";
    console.log(newFontSize);
    html.style.setProperty("font-size",newFontSize);
    window.userData.fontSize = newFontSize;
}
window.increaseTextSize = increaseTextSize;

function decreaseTextSize() {
    var html = document.getElementsByTagName("html")[0];
    var fontSize = html.style.fontSize;
    var newfontSizeString = (parseInt(fontSize) - 10).toString();
    var newFontSize = newfontSizeString + "%";
    console.log(newFontSize);
    html.style.setProperty("font-size",newFontSize);
    window.userData.fontSize = newFontSize;
}
window.decreaseTextSize = decreaseTextSize;

//Color Inputs
var textColorInput = document.getElementById("textColorInput");
textColorInput.addEventListener('change', () => {
    document.getElementsByTagName("body")[0].style.color = textColorInput.value;
    window.userData.textColor = textColorInput.value;
});

var UIColorInput = document.getElementById("UIColorInput");
UIColorInput.addEventListener('change', () => {
    var bgColorElements = document.getElementsByClassName('bg-color');
    for(var element of bgColorElements){
        element.style.backgroundColor = UIColorInput.value;
    }
    window.userData.UIColor = UIColorInput.value;
});

//Button mapping
var buttonRightInput = document.getElementById("buttonRightInput");
var buttonLeftInput = document.getElementById("buttonLeftInput");

var buttonRightRecord = document.getElementById("buttonRightRecord");
buttonRightRecord.addEventListener('click', () => {
    console.log("we listenin right");
    window.addEventListener('keydown', event => {
        console.log("We pressin: ", event);
        buttonRightInput.value = event.key;
        window.userData.rightKey = event.keyCode;
        window.userData.rightKeyName = event.key;
    }, { once: true });
})

var buttonLeftRecord = document.getElementById("buttonLeftRecord");
buttonLeftRecord.addEventListener('click', () => {
    console.log("we listenin left");
    window.addEventListener('keydown', event => {
        console.log("We pressin: ", event);
        buttonLeftInput.value = event.key;
        window.userData.leftKey = event.keyCode;
        window.userData.leftKeyName = event.key;
    }, { once: true });
})

