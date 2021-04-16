
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

function initTopDrag() {
    const topDiv = document.createElement('div')
    topDiv.style.position = 'fixed'
    topDiv.style.top = 0
    topDiv.style.left = 0
    topDiv.style.height = '25px'
    topDiv.style.width = '100%'
    topDiv.style.zIndex = '9999'
    topDiv.style.pointerEvents = 'none' // 捕获不大任何点击，而是让事件穿透到它下面
    topDiv.style['-webkit-user-select'] = 'none' // 禁止选择文字
    topDiv.style['-webkit-app-region'] = 'drag'

    document.body.appendChild(topDiv)
}

window.addEventListener('DOMContentLoaded', ()=> {
    initTopDrag()
})