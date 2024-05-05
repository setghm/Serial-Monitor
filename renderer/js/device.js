let PORTS = {}

const DEVICE = {
    name: '',
    path: '',
    baudRate: 0
}

/**
 * Show Device information dialog.
 */
buttonDeviceInfo.addEventListener('click', () => {
    const buttonClose = informationDialog.querySelector('button')

    buttonClose.addEventListener('click', () => {
        informationDialog.classList.add('hidden')
    })

    informationDialog.addEventListener('click', (e) => {
        if (e.target === informationDialog) {
            informationDialog.classList.add('hidden')
        }
    })

    const selected = portSelect.value

    // Populate the information dialog.
    const rows = informationDialog.querySelectorAll('.info-value')
    const info = PORTS[selected]
    rows[0].textContent = info.friendlyName
    rows[1].textContent = info.path
    rows[2].textContent = info.manufacturer
    rows[3].textContent = info.serialNumber
    rows[4].textContent = info.pnpId
    rows[5].textContent = info.locationId
    rows[6].textContent = info.productId
    rows[7].textContent = info.vendorId

    // Display the information dialog.
    informationDialog.classList.remove('hidden')
})

// When distinct port is selected by the user
portSelect.addEventListener('change', () => {
    /*console.log(`Device Path changed ${portSelect.value}`)
    deviceOpen(portSelect.value, getBaudRate())*/

    // Change the connect/disconnect button label.
    if (portSelect.value === DEVICE.path) {
        buttonDeviceDisconnect.textContent = 'Disconnect'
        buttonDeviceDisconnect.removeEventListener('click', deviceConnect)
        buttonDeviceDisconnect.addEventListener('click', deviceDisconnect)
    } else {
        buttonDeviceDisconnect.textContent = 'Connect'
        buttonDeviceDisconnect.removeEventListener('click', deviceDisconnect)
        buttonDeviceDisconnect.addEventListener('click', deviceConnect)
    }
})

/**
 * Send an update request when distinct baud rate is selected by the user.
 */
baudRateSelect.addEventListener('change', () => {
    let baudRate = parseInt(baudRateSelect.value)
    console.log(`Baud rate changed ${baudRate}`)
    window.electronAPI.setBaudRate(baudRate)
})

// Disconnect the current device.
function deviceDisconnect() {
    whenDeviceDisconnects()

    // Clear device info.
    DEVICE.name = ''
    DEVICE.path = ''
    DEVICE.baudRate = 0

    window.electronAPI.deviceDisconnect()
}

function deviceConnect() {
    console.log('Connecting to device...')
    deviceOpen(portSelect.value, getBaudRate())
}

function deviceOpen(path, baudRate) {
    appTitle.textContent = `Opening ${path}...`

    // Save device info.
    DEVICE.name = PORTS[path].friendlyName
    DEVICE.path = path
    DEVICE.baudRate = baudRate

    window.electronAPI.deviceOpen(path, baudRate);
}

window.electronAPI.onDeviceOpened((err) => {
    appTitle.textContent = DEVICE.name

    if (!err) {
        whenDeviceConnects()
        console.log(PORTS[DEVICE.path])
    } else {
        console.log('Error opening the device: ', err)
        console.log(`Can't open ${DEVICE.path}`)

        // Clear device info.
        DEVICE.name = ''
        DEVICE.path = ''
        DEVICE.baudRate = 0
    }

    errorSetLast(err)
})

/**
 * Dislay the serial data.
 */
window.electronAPI.onDataReceived(data => {
    //console.log(`Incoming data: ${data}`)
    putLine(data)
})

// Send data to device.
function deviceSendData(data) {
    if (typeof data === 'undefined') {
        return
    }
    window.electronAPI.writeDeviceData(data)
    putLine(data, false)
}

// Update the list of available ports.
window.electronAPI.onPortsUpdated(ports => {
    PORTS = {}
    
    if (ports === 'No devices') {
        // Empty the title.
        appTitle.textContent = ''
        appTitle.classList.remove('connected')

        // Disable the device information button.
        buttonDeviceInfo.disabled = true
        
        // Disable the connect/disconnect button.
        buttonDeviceDisconnect.textContent = 'Connect'
        buttonDeviceDisconnect.disabled = true
        
        // Disable the select element.
        portSelect.disabled = true
        portSelect.innerHTML = `<option value="" selected disabled hidden>${ports}</option>`
    } else {
        // Enable the device information button.
        buttonDeviceInfo.disabled = false
        // Enable the connect/disconnect button.
        buttonDeviceDisconnect.disabled = false
        // Enable the select element.
        portSelect.disabled = false
        portSelect.innerHTML = ""
        
        ports.forEach(port => {
            portSelect.innerHTML += `<option value="${port.path}">${port.path}</option>`
            PORTS[port.path] = port
        })

        portSelect.value = ports[0].path
        portSelect.dispatchEvent(new Event('change'))
    }
})