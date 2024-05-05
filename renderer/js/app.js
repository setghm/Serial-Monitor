const appTitle = document.getElementById('app-title')
const baudRateSelect = document.querySelector('#baud-rate-select')
//const buttonGetPorts = document.querySelector('#get-ports')
const menuLine = document.querySelector('#line-menu')
const menuTextEdit = document.querySelector('#text-edit-menu')
const portSelect = document.getElementById('port-select')
const serialReader = document.querySelector('#serial-reader')
const serialInfo = document.querySelector('#serial-info')
const serialWriter = document.querySelector('#serial-writer')
const serialInput = document.querySelector('#serial-input')
const timeMark = document.querySelector('#time-mark')
const buttonSerialSend = document.querySelector('button#serial-send')
const buttonDeviceDisconnect = document.querySelector('button#device-disconnect')
const buttonDeviceInfo = document.querySelector('button#device-info')
const informationDialog = document.querySelector('#information-dialog')
const serialLineEndSelect = document.getElementById('serial-line-end')
const welcomeMessage = document.querySelector('.welcome-message')
const buttonAbout = document.querySelector('button#about')
const aboutDialog = document.querySelector('.dialog#about-dialog')
const errorDialog = document.querySelector('.dialog#error-dialog')

let autoScrollEnabled = true

/*
 *  Helper: Return current time in a formated string
**/
function now() {
    let time = new Date()
    return `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
}

/*
 *  Helper: Format number with a leading zero
**/
function pad(num) {
    if (num <= 9) {
        return "0" + num
    }
    return num
}

/*
 *  Helper: Add css animation class and remove it after delay time
**/
function animate(element, cssClass, delayTime) {
    element.classList.add(cssClass)
    setTimeout(() => element.classList.remove(cssClass), delayTime)
}

/*
 *  Helper: Get selected baud rate
**/
function getBaudRate() {
    return parseInt(baudRateSelect.value)
}

/*
 *  Add and remove box shadow in top bar and bottom bar when
 *  the user scrolls the content
 * 
 *  Also activates and deactivates the autoscroll.
 *  The auto scroll is deactivated when the user scrolls to top.
**/
serialReader.addEventListener("scroll", (e) => {
    let scrollHeight = serialReader.scrollHeight
    let scrollTop = serialReader.scrollTop
    let height = serialReader.clientHeight

    // Top shadow.
    if (scrollTop === 0) {
        serialInfo.classList.remove('shadow')
    } else {
        serialInfo.classList.add('shadow')
    }
    
    // Bottom shadow.
    if (scrollHeight - scrollTop === height) {
        // Enable the auto scroll if the user scrolls down.
        autoScrollEnabled = true
        serialWriter.classList.remove('shadow')
    } else {
        // Disable the auto scroll if the user scrolls up.
        autoScrollEnabled = false
        serialWriter.classList.add('shadow')
    }
})

/**
 * Display the about dialog.
 */
buttonAbout.addEventListener('click', () => {
    const buttonClose = aboutDialog.querySelector('button.close-button')

    buttonClose.addEventListener('click', () => {
        aboutDialog.classList.add('hidden')
    })
    aboutDialog.addEventListener('click', (e) => {
        if (e.target === aboutDialog) {
            aboutDialog.classList.add('hidden')
        }
    })

    aboutDialog.classList.remove('hidden')
})

/**
 * Elements that should be enabled and changes that should be made
 * when the device is connected.
 */
function whenDeviceConnects() {
    buttonSerialSend.disabled = false
    appTitle.classList.add('connected')

    // Hide the welcome-message.
    welcomeMessage.classList.add('hidden')
}

/**
 * Elements that should be disabled and changes that should be made
 * when the device is disconnected.
 */
function whenDeviceDisconnects() {
    buttonSerialSend.disabled = true
    appTitle.textContent = ''
    appTitle.classList.remove('connected')
}