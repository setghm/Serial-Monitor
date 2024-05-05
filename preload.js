const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
	//getPortList: () => ipcRenderer.invoke('get:ports'),
	deviceSelected: (path) => ipcRenderer.send('device-selected', path),
	deviceOpen: (path, baudRate) => ipcRenderer.send('device-open', path, baudRate),
	setBaudRate: (baudRate) => ipcRenderer.send('set:baud-rate', baudRate),
	writeDeviceData: (data) => ipcRenderer.send('write-data', data),
	deviceDisconnect: () => ipcRenderer.send('device-disconnect'),

	// Main to renderer.
	onDeviceOpened: (callback) => ipcRenderer.on('device-opened', (_event, err) => callback(err)),
	onDataReceived: (callback) => ipcRenderer.on('data-received', (_event, data) => callback(data)),
	onPortsUpdated: (callback) => ipcRenderer.on('ports-updated', (_event, ports) => callback(ports))
})

