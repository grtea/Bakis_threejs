var settingsButton = document.getElementsByClassName('settings-button')[0].getElementsByTagName('button')[0];
var settingsModal = document.getElementsByClassName('settings-modal')[0];
var startGameScreen = document.getElementsByClassName('startGameScreen')[0];
var html = document.getElementsByTagName("html")[0];
var body = document.getElementsByTagName("body")[0];
var textColorInput = document.getElementById("textColorInput");
var UIColorInput = document.getElementById("UIColorInput");
var buttonRightInput = document.getElementById("buttonRightInput");
var buttonLeftInput = document.getElementById("buttonLeftInput"); 
var onScreenBtnCheckbox = document.getElementById('onScreenBtnCheckbox');
var mouseControlsCheckbox = document.getElementById('mouseControlsCheckbox');
var contrastOutlineCheckbox = document.getElementById('contrastOutlineCheckbox');
var contrastBackgroundCheckbox = document.getElementById('contrastBackgroundCheckbox');
var uiSoundSlider = document.getElementById('uiSoundSlider');
var gameSoundSlider = document.getElementById('gameSoundSlider');
var speechSoundSlider = document.getElementById('speechSoundSlider');
var reloadOnSave = false;

//SETTINGS CONTROL
function openSettings(){
    settingsModal.style.display = 'inline';
    settingsButton.style.display = 'none';
    startGameScreen.style.display = 'none';
    window.settingsOpen = true;
}
window.openSettings = openSettings;

function closeSettings(){
    settingsModal.style.display = 'none';
    settingsButton.style.display = 'inline';
    startGameScreen.style.display = 'inline';
    window.settingsOpen = false;
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
    if(reloadOnSave){
        reloadOnSave = false;
        window.location.reload();
    }else{
        closeSettings();
    }
}
window.saveChanges = saveChanges;

//LOADING USER DATA
export function setDefault(){
    window.userData.fontSize = "110%";
    window.userData.textColor = "#212529";
    window.userData.UIColor = "#ffffff";
    window.userData.rightKey = 39;
    window.userData.rightKeyName = "ArrowRight";
    window.userData.leftKey = 37;
    window.userData.leftKeyName = "ArrowLeft";
    window.userData.onScreenButtons = false;
    window.userData.mouseControls = false;
    window.userData.highContrast = false;
    window.userData.outline = false;
    window.userData.uiVolume = 1.0;
    window.userData.gameVolume = 1.0;
    window.userData.speechVolume = 1.0;
}

export function loadUserData(){
    window.userData = JSON.parse(localStorage.getItem('userData'));
}

export function applyUserData(){
    html.style.setProperty("font-size", window.userData.fontSize);
    
    body.style.color = window.userData.textColor;
    textColorInput.value = window.userData.textColor;
    document.documentElement.style.setProperty('--border-color', window.userData.textColor);
    document.documentElement.style.setProperty('--settings-icon-color', window.userData.textColor);

    UIColorInput.value = window.userData.UIColor;
    var bgColorElements = document.getElementsByClassName('bg-color');
    for(var element of bgColorElements){
        element.style.backgroundColor = window.userData.UIColor;
    }

    buttonRightInput.value = window.userData.rightKeyName;
    buttonLeftInput.value = window.userData.leftKeyName;

    onScreenBtnCheckbox.checked = window.userData.onScreenButtons;
    mouseControlsCheckbox.checked = window.userData.mouseControls;

    contrastOutlineCheckbox.checked = window.userData.outline;
    contrastBackgroundCheckbox.checked = window.userData.highContrast;

    uiSoundSlider.value = window.userData.uiVolume;
    gameSoundSlider.value = window.userData.gameVolume;
    speechSoundSlider.value = window.userData.speechVolume;
}

//SETTINGS CHANGES
function increaseTextSize() {
    var fontSize = html.style.fontSize;
    var newfontSizeString = (parseInt(fontSize) + 10).toString();
    var newFontSize = newfontSizeString + "%";
    html.style.setProperty("font-size",newFontSize);
    window.userData.fontSize = newFontSize;
}
window.increaseTextSize = increaseTextSize;

function decreaseTextSize() {
    var fontSize = html.style.fontSize;
    var newfontSizeString = (parseInt(fontSize) - 10).toString();
    var newFontSize = newfontSizeString + "%";
    html.style.setProperty("font-size",newFontSize);
    window.userData.fontSize = newFontSize;
}
window.decreaseTextSize = decreaseTextSize;

//Color Inputs
textColorInput.addEventListener('change', () => {
    window.userData.textColor = textColorInput.value;
    applyUserData();
});

UIColorInput.addEventListener('change', () => {
    window.userData.UIColor = UIColorInput.value;
    applyUserData();
});

//Button mapping
var buttonRightRecord = document.getElementById("buttonRightRecord");
buttonRightRecord.addEventListener('click', () => {
    buttonRightInput.value = "Recording input..."; 
    buttonRightRecord.innerHTML = '<i class="fa-solid fa-circle" style="color: red"></i>';
    window.addEventListener('keydown', event => {
        if(event.keyCode != 27){
            window.userData.rightKey = event.keyCode;
            window.userData.rightKeyName = event.key;
        }
        buttonRightRecord.innerHTML = '<i class="fa-solid fa-pen" style="color: '+ window.userData.textColor +'"></i>';
        applyUserData();
    }, { once: true });
})

var buttonLeftRecord = document.getElementById("buttonLeftRecord");
buttonLeftRecord.addEventListener('click', () => {
    buttonLeftInput.value = "Recording input..."; 
    buttonLeftRecord.innerHTML = '<i class="fa-solid fa-circle" style="color: red"></i>';
    window.addEventListener('keydown', event => {
        if(event.keyCode != 27){ //escape option
            window.userData.leftKey = event.keyCode;
            window.userData.leftKeyName = event.key;
        }
        buttonLeftRecord.innerHTML = '<i class="fa-solid fa-pen" style="color: '+ window.userData.textColor +'"></i>';
        applyUserData();
    }, { once: true });
})

onScreenBtnCheckbox.addEventListener('click', () => {
    // console.log(onScreenBtnCheckbox.checked);
    if(onScreenBtnCheckbox.checked){
        window.userData.onScreenButtons = true;
    }
    else{
        window.userData.onScreenButtons = false;
    }
    applyUserData();
})

mouseControlsCheckbox.addEventListener('click', () => {
    if(mouseControlsCheckbox.checked){
        window.userData.mouseControls = true;
    }
    else{
        window.userData.mouseControls = false;
    }
})

contrastOutlineCheckbox.addEventListener('click', () => {
    window.userData.outline = contrastOutlineCheckbox.checked;
});

contrastBackgroundCheckbox.addEventListener('click', () => {
    window.userData.highContrast = contrastBackgroundCheckbox.checked;
    reloadOnSave = true;
})

//checkboxes clickable with enter
document.addEventListener('keypress', (e) => {
    if( e.key === "Enter"  && e.target.classList.contains('form-check-input')){
        // e.target.checked = !e.target.checked;
        e.target.click();
    }
})

//Volume sliders
uiSoundSlider.addEventListener('change', () => {
    window.userData.uiVolume = parseFloat(uiSoundSlider.value);
    reloadOnSave = true;
});

gameSoundSlider.addEventListener('change', () => {
    window.userData.gameVolume = parseFloat(gameSoundSlider.value);
    reloadOnSave = true;
});

speechSoundSlider.addEventListener('change', () => {
    window.userData.speechVolume = parseFloat(speechSoundSlider.value);
    reloadOnSave = true;
});