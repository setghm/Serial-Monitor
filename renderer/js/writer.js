serialInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        buttonSerialSend.click()
    }
})

timeMark.addEventListener('click', () => {
    if (timeMark.checked) {
        serialReader.classList.remove('time-mark-hidden')
    } else {
        serialReader.classList.add('time-mark-hidden')
    }
})

buttonSerialSend.addEventListener('click', () => {
    let data = serialInput.value

    switch (serialLineEndSelect.value) {
        case 'crlf':    data += '\r\n'; break;
        case 'lf':      data += '\n';   break;
        case 'cr':      data += '\r';   break;
    }

    deviceSendData(data)
    serialInput.value = ''
})

