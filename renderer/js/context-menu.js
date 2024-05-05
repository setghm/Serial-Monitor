let activeCtxMenu = null
let activeCtxMenuTarget = null

// Helper: gets the selected text in the window
function getSelectedText() {
    return window.getSelection().toString()
}

// Helper: checks if text is currently selected
function isTextSelected() {
    return getSelectedText().length > 0
}

// Helper: calculates a visible position for a context menu
function contextMenuPosition(menu, x, y) {
    const remainingWidth = window.innerWidth - x
    const remainingHeight = window.innerHeight - y
    const neededWidth = menu.clientWidth + 10
    const neededHeight = menu.clientHeight + 10

    if (remainingWidth < neededWidth) {
        menu.style.left = `${x - menu.clientWidth}px`
    } else {
        menu.style.left = `${x}px`
    }

    if (remainingHeight < neededHeight) {
        menu.style.top = `${y - menu.clientHeight}px`
    } else {
        menu.style.top = `${y}px`
    }
}

// Helper: register a callback to disappear the context menu
function contextMenuCallback(menu) {
    let disappear = function() {
        contextMenuShow(menu, false)
        window.removeEventListener('click', this)
        activeCtxMenu = null
    }
    window.addEventListener('click', disappear)
}

// Helper: show a context menu
function contextMenuShow(menu, show=true) {
    if (show) {
        menu.classList.remove('hidden')
    } else {
        menu.classList.add('hidden')
    }
}

// Helper: enable context menu option
function menuOptionEnable(option, enable, callback) {
    if (enable) {
        option.classList.remove('disabled')
        option.addEventListener('click', callback)
    } else {
        option.classList.add('disabled')
        option.removeEventListener('click', callback)
    }
}

// Helper: show the text edit context menu
function showTextEditMenu(x, y, isTheTextEditable=false) {
    if (activeCtxMenu && activeCtxMenu != menuTextEdit) {
        contextMenuShow(activeCtxMenu, false)
    }
    activeCtxMenu = menuTextEdit

    let enableCopy = isTextSelected()
    let enableCut = enableCopy && isTheTextEditable
    let enablePaste = isTheTextEditable

    contextMenuShow(menuTextEdit)
    contextMenuPosition(menuTextEdit, x, y)
    contextMenuCallback(menuTextEdit)

    const options = menuTextEdit.querySelectorAll('.menu-option')

    menuOptionEnable(options[0], enableCopy, copyTextCallback)
    menuOptionEnable(options[1], enableCut, cutTextCallback)
    menuOptionEnable(options[2], enablePaste, pasteTextCallback)
}

// Helper: show the line context menu
function showLineMenu(id, x, y, lineMarked, enableLineOptions=true) {
    // Check if there are available lines.
    const enableLinesOptions = readerLastLineId > 0

    // Check if there are highlighted lines.
    const enableOnlyMarkedFilter = serialReader.querySelectorAll('.serial-line.marked').length > 0
    // Check if there are received and sent data lines.
    const enableSentReceivedFilter = serialReader.querySelectorAll('.serial-line.received').length > 0
                                    && serialReader.querySelectorAll('.serial-line.sent').length > 0

    // Check if the unhighlighed lines are hidden.
    const onlyMarked = serialReader.classList.contains('only-marked')
    // Check if the sent data lines are hidden.
    const onlyReceived = serialReader.classList.contains('only-received')
    // Check if the received data lines are hidden.
    const onlySent = serialReader.classList.contains('only-sent')

    if (activeCtxMenu && activeCtxMenu != menuLine) {
        contextMenuShow(activeCtxMenu, false)
    }
    activeCtxMenu = menuLine

    menuLine.lastLineActive = id
    
    contextMenuShow(menuLine)
    contextMenuPosition(menuLine, x, y)
    contextMenuCallback(menuLine)
    
    const options = menuLine.querySelectorAll('.menu-option')

    // Change highlight option text.
    options[2].textContent = lineMarked ? 'Unhighlight' : 'Highlight'
    options[3].textContent = onlyMarked ? 'Show unhighlighted' : 'Hide unhighlighted'
    options[4].textContent = onlyReceived ? 'Show sent data' : 'Hide sent data'
    options[5].textContent = onlySent ? 'Show received data' : 'Hide received data'

    menuOptionEnable(options[0], enableLineOptions, copyLineCallback)
    menuOptionEnable(options[1], enableLineOptions, deleteLineCallback)
    menuOptionEnable(options[2], enableLineOptions, highlightLineCallback)
    menuOptionEnable(options[3], enableLinesOptions && enableOnlyMarkedFilter, hideUnhighlightedCallback)
    menuOptionEnable(options[4], enableLinesOptions && !onlySent && enableSentReceivedFilter, hideSentCallback)
    menuOptionEnable(options[5], enableLinesOptions && !onlyReceived && enableSentReceivedFilter, hideReceivedCallback)
    menuOptionEnable(options[6], enableLinesOptions, clearAllLinesCallback)
}

// Callback: copy text
function copyTextCallback(e) {
    navigator.clipboard.writeText(getSelectedText())
}

// Callback: cut text
function cutTextCallback(e) {
    const tagName = activeCtxMenuTarget.tagName || ''
    const tagType = activeCtxMenuTarget.type || ''

    // Check if the selection paste target element is a valid input element.
    if (tagName === 'INPUT' && tagType === 'text') {
        const start = activeCtxMenuTarget.selectionStart
        const end = activeCtxMenuTarget.selectionEnd
        const originalString = activeCtxMenuTarget.value

        // Get the selected string.
        const selection = originalString.slice(start, end)

        // Remove the selected string from the target.
        activeCtxMenuTarget.value = originalString.slice(0, start) + originalString.slice(end)

        // Put the text into the clipboard.
        navigator.clipboard.writeText(selection)
    }
}

// Callback: paste text
function pasteTextCallback(e) {
    const tagName = activeCtxMenuTarget.tagName || ''
    const tagType = activeCtxMenuTarget.type || ''

    // Check if the selection paste target element is a valid input element.
    if (tagName === 'INPUT' && tagType === 'text') {
        navigator.clipboard.readText().then(text => {
            activeCtxMenuTarget.value += text
            activeCtxMenuTarget.focus()

            activeCtxMenuTarget = null
        })
    }
}

// Callback: Copy line contents.
function copyLineCallback() {
    const line = document.getElementById(menuLine.lastLineActive)

    if (line) {
        const content = line.querySelector('p').textContent
        navigator.clipboard.writeText(content)
    }
}

function deleteLineCallback() {
    deleteLineById(menuLine.lastLineActive)
}

function highlightLineCallback() {
    const line = document.getElementById(menuLine.lastLineActive)
    line.classList.toggle('marked')
}

function hideUnhighlightedCallback() {
    serialReader.classList.toggle('only-marked')
}

function clearAllLinesCallback() {
    clearLines()
}

function hideSentCallback() {
    serialReader.classList.toggle('only-received')
}

function hideReceivedCallback() {
    serialReader.classList.toggle('only-sent')
}

// Elements right click event
const showContextMenu = (e) => {
    e.preventDefault()
    
    activeCtxMenuTarget = e.target
    const textEditable = e.target.tagName === 'INPUT' && e.target.type === 'text'

    const { clientX: mouseX, clientY: mouseY } = e
    showTextEditMenu(mouseX, mouseY, textEditable)
}

informationDialog.addEventListener('contextmenu', showContextMenu)
serialInput.addEventListener('contextmenu', showContextMenu)


// Helper: register a context menu event on a serial line element
function serialLineContextMenuEvent(line) {
    line.addEventListener('contextmenu', (e) => {
        e.preventDefault()

        const { clientX: mouseX, clientY: mouseY } = e

        if (isTextSelected()) {
            activeCtxMenuTarget = line
            showTextEditMenu(mouseX, mouseY)
        } else {
            // Check if the line is highlighted.
            const marked = line.classList.contains('marked')

            showLineMenu(line.id, mouseX, mouseY, marked)
        }
    })
}

// Registers a contextmenu callback for the serial reader area.
serialReader.addEventListener('contextmenu', (e) => {
    if (e.target === serialReader) {
        e.preventDefault()
        const { clientX: mouseX, clientY: mouseY } = e
        
        showLineMenu('', mouseX, mouseY, false, false)
    }
})
