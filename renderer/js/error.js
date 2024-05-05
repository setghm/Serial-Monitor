let _lastDeviceError

function errorSetLast(err) {
    _lastDeviceError = err

    // Set title class.
    if (err) {
        appTitle.classList.add('error')
        appTitle.addEventListener('click', errorDialogShow)
        errorDialogShow()
    } else {
        appTitle.classList.remove('error')
        appTitle.removeEventListener('click', errorDialogShow)
    }
}

errorDialog.querySelector('button.close-button').addEventListener('click', () => {
    errorDialog.classList.add('hidden')
})

errorDialog.addEventListener('click', (e) => {
    if (e.target === errorDialog) {
        errorDialog.classList.add('hidden')
    }
})

function errorDialogShow() {
    const errorDescription = errorDialog.querySelector('.error-description')
    errorDescription.textContent = _lastDeviceError

    // Show the error dialog.
    errorDialog.classList.remove('hidden')
}
