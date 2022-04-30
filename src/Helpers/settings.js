var settingsButton = document.getElementsByClassName('settings-button')[0].getElementsByTagName('button')[0];
var settingsModal = document.getElementsByClassName('settings-modal')[0];


//SETTINGS CONTROL
function openSettings(){
    settingsModal.style.display = 'inline';
    settingsButton.style.display = 'none';
}
window.openSettings = openSettings;

function closeSettings(){
    settingsModal.style.display = 'none';
    settingsButton.style.display = 'inline';
    loadUserData();
    applyUserData();
}
window.closeSettings = closeSettings;

function resetOptions(){
    setDefault();
    applyUserData();
}
window.resetOptions = resetOptions;

function saveChanges(){
    localStorage.setItem("userData", JSON.stringify(window.userData));
    closeSettings();
}
window.saveChanges = saveChanges;

//LOADING USER DATA
export function setDefault(){
    window.userData.fontSize = "100%";
    window.userData.textColor = "#212529";
    window.userData.UIColor = "#ffffff";
    window.userData.rightKey = 39;
    window.userData.rightKeyName = "ArrowRight";
    window.userData.leftKey = 37;
    window.userData.leftKeyName = "ArrowLeft";
    window.userData.onScreenButtons = false;
}

export function loadUserData(){
    window.userData = JSON.parse(localStorage.getItem('userData'));
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

    document.getElementById('onScreenBtnCheckbox').checked = window.userData.onScreenButtons;
}

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
    window.userData.UIColor = UIColorInput.value;
    applyUserData();
});

//Button mapping
var buttonRightRecord = document.getElementById("buttonRightRecord");
buttonRightRecord.addEventListener('click', () => {
    //TODO: LISTENING FOR INPUT
    var buttonRightInput = document.getElementById("buttonRightInput");
    buttonRightInput.value = "Recording input..."; 
    buttonRightRecord.innerHTML = '<i class="fa-solid fa-circle" style="color: red"></i>';
    window.addEventListener('keydown', event => {
        window.userData.rightKey = event.keyCode;
        window.userData.rightKeyName = event.key;
        buttonRightRecord.innerHTML = '<i class="fa-solid fa-pen" style="color: black"></i>';
        applyUserData();
    }, { once: true });
})

var buttonLeftRecord = document.getElementById("buttonLeftRecord");
buttonLeftRecord.addEventListener('click', () => {
    //TODO: LISTENING FOR INPUT
    var buttonLeftInput = document.getElementById("buttonLeftInput");
    buttonLeftInput.value = "Recording input..."; 
    buttonLeftInput.innerHTML = '<i class="fa-solid fa-circle" style="color: red"></i>';
    window.addEventListener('keydown', event => {
        window.userData.leftKey = event.keyCode;
        window.userData.leftKeyName = event.key;
        buttonLeftRecord.innerHTML = '<i class="fa-solid fa-pen" style="color: black"></i>';
        applyUserData();
    }, { once: true });
})

var onScreenBtnCheckbox = document.getElementById('onScreenBtnCheckbox');
onScreenBtnCheckbox.addEventListener('click', () => {
    if(onScreenBtnCheckbox.checked){
        window.userData.onScreenButtons = true;
    }
    else{
        window.userData.onScreenButtons = false;
    }
    applyUserData();
})