//let readerLines = []
let readerLastLineId = 0

// Create a new line with the desired text
function putLine(text, /*parentList, parentElement,*/ received=true) {
    const line = {
        id: readerLastLineId++,
        text: text,
        markColor: 'transparent',
        time: now(),
    }

    //parentList.push(line)

    const htmlFragment = newLine(line)
    serialReader.appendChild(htmlFragment)
    //scrollToBottom(parentElement)

    const lineElement = document.querySelector('#line-' + line.id)
    lineElement.classList.add(received ? 'received' : 'sent')
    serialLineContextMenuEvent(lineElement)

    // Scroll to the last position of the lines container.
    if (autoScrollEnabled) {
        serialReader.scroll(0, serialReader.scrollHeight)
    }
}

// Append text to last line
/*function appendLine(text, parentList, parentElement) {
    parentList[parentList.length - 1].text = text
}*/

// Helper: creates a new line object and HTML element
function newLine(line) {
    let template = document.querySelector('#serial-line-template')
    let newHTML = template.content.cloneNode(true)

    let spanTimeMark = newHTML.querySelector('.time-mark')

    spanTimeMark.parentElement.setAttribute("id", "line-" + line.id)
    newHTML.querySelector('p').textContent = line.text
    spanTimeMark.textContent = line.time

    /*if (!timeMarkActive) {
        spanTimeMark.classList.add('hidden')
    }*/

    return newHTML
}

// Removes all the lines from the document and the memory array.
function clearLines() {
    serialReader.innerHTML = ''
    //readerLines = []
    readerLastLineId = 0
}

// Removes a line with a specific ID.
function deleteLineById(lineId) {
    const line = document.getElementById(lineId)
    line.parentElement.removeChild(line)
}
