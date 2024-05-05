const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

const { app, ipcMain, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')
const { WindowsBinding, DarwinBinding, LinuxBinding } = require('@serialport/bindings-cpp')

/*require('electron-reload')(__dirname + "/renderer/app.html", {
	electron: path.join(__dirname, 'node_modules', '.bin', 'electron.cmd')
})*/

let browserWindow

function createWindow() {
	browserWindow = new BrowserWindow({
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			// Disable developer tools.
			devTools: false,
		},
		width: 800,
		height: 480,
		minWidth: 720,
		minHeight: 480,
		icon: 'renderer/img/icon.png',
		autoHideMenuBar: true
	})
	
	browserWindow.loadFile('renderer/app.html')
	
	// Remove the menu bar.
	browserWindow.setMenu(null)
}

app.whenReady().then(() => {
	//ipcMain.handle('get:ports', getAvailablePorts)
	ipcMain.on('device-open', openDevice)
	ipcMain.on('device-selected', openDevice)
	ipcMain.on('set:baud-rate', setBaudRate)
	ipcMain.on('write-data', writeDeviceData)
	ipcMain.on('device-disconnect', deviceDisconnect)

	createWindow()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin'){
		app.quit()
	}
})

// Disable reload shortcut.
app.on('browser-window-focus', function () {
    globalShortcut.register("CommandOrControl+R", () => {
        console.log("CommandOrControl+R is pressed: Shortcut Disabled");
    });
    globalShortcut.register("F5", () => {
        console.log("F5 is pressed: Shortcut Disabled");
    });
});

app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('F5');
});

// Ports logic
/*
async function getAvailablePorts() {
	const ports = await SerialPort.list()
	
	if (ports.length === 0) {
		return "No devices"
	}
	
	return ports
}*/

let lastPorts = []

/**
 * Look for new COM connections each 0.5 seconds
 */
setInterval(async () => {
	const ports = await SerialPort.list()

	if (ports.length === 0 && lastPorts.length !== 0) {
		browserWindow.webContents.send('ports-updated', 'No devices')

		// Update the port array.
		lastPorts = ports
	} else {
		const difference = ports.filter(p => !lastPorts.includes(p))

		if (difference.length != 0) {
			// New devices was added.
			browserWindow.webContents.send('ports-updated', ports)

			// Update the port array.
			lastPorts = ports
		}
	}
}, 500);

// Device control

let device

function setBaudRate(event, baudRate) {
	if (!device) {
		console.error('The device is not connected')
		return
	}

	if (device.baudRate === baudRate) {
		return
	}
	
	console.log(`Changing baud rate to ${baudRate}`)
	
	device.update({baudRate: baudRate}, err => {
		if (err) {
			console.log(err)
		} else {
			console.log('setBaudRate(): No errors detected')
		}
	})
}

function openDevice(event, path, baudRate) {
	console.log(`Selected port: ${path}`)
	
	if (device) {
		if (path === device.path) {
			console.log('Device opened already')

			// Communicate with the renderer.
			// Send the status of the operation.
			browserWindow.webContents.send('device-opened', null)
			
			return
		}

		// Close the current device.
		deviceDisconnect()
	}

	device = new SerialPort({
		path: path,
		baudRate: baudRate
	}, err => {
		if (err) {
			console.log(err)
			device = null
		} else {
			console.log('openDevice(): No errors detected')

			const parser = device.pipe(new ReadlineParser())

			parser.on('data', getDeviceData)
			device.on('error', getDeviceError)
		}

		// Communicate with the renderer.
		// Send the status of the operation.
		browserWindow.webContents.send('device-opened', err)
	})
}

function getDeviceData(chunk) {
	//console.log(`Incoming data: ${chunk}`)
	browserWindow.webContents.send('data-received', chunk)
}

function getDeviceError(err) {
	if (!device) {
		console.error('The device is not connected')
		return
	}
	
	if (err.disconnected == true) {
		console.log('Device was disconnected')
	}
}

function writeDeviceData(event, data) {
	if (!device) {
		console.error('The device is not connected')
		return
	}

	const chunk = Buffer.from(data, 'utf8')

	device.write(chunk, 'utf8', (err) => {
		if (err) {
			console.log('Can\'t write data to device')
		} else {
			console.log(`writeDeviceData(): OK`)
		}
	})
}

function deviceDisconnect() {
	device.close()
	device = null
	console.log('Device closed')
}
