
const { app } = require('electron')
let template = [{
    label: '视图',
    submenu: [{
        label: '排序方式',
        submenu: [{
            label: '手动',
            type: 'radio',
            checked: true,
            click: (item, focusedWindow) => {
                focusedWindow.webContents.send('sortBy', 'manual')
            }
        }, {
            label: '创建日期',
            type: 'radio',
            click: (item, focusedWindow) => {
                focusedWindow.webContents.send('sortBy', 'createTime')
            }
        }, {
            label: '优先级',
            type: 'radio',
            click: (item, focusedWindow) => {
                focusedWindow.webContents.send('sortBy', 'priority')
            }
        }]
    }, {
        label: '隐藏边栏',
        click: (item, focusedWindow) => {
            console.log('hide slider');
            focusedWindow.webContents.send('hideSlide')
        }
    }, {
        label: '创建事项',
        accelerator: 'CommandOrControl+Alt+L',
        click: (item, focusedWindow) => {
            focusedWindow.webContents.send('addMaster')
        }
    }, {
        label: '全屏',
        accelerator: (() => {
            if (process.platform === 'darwin') {
                return 'Ctrl+Command+F'
            } else {
                return 'F11'
            }
        })(),
        click: (item, focusedWindow) => {
            if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
            }
        }
    }, {
        label: '开发者工具',
        accelerator: (() => {
            if (process.platform === 'darwin') {
                return 'Alt+Command+I'
            } else {
                return 'Ctrl+Shift+I'
            }
        })(),
        click: (item, focusedWindow) => {
            if (focusedWindow) {
                focusedWindow.toggleDevTools()
            }
        }
    }]
}, {
    label: '窗口',
    role: 'window',
    submenu: [{
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
    }, {
        label: '缩放',
        role: 'zoom'
    }]
}]

if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
        label: name,
        submenu: [{
            label: `关于 ${name}`,
            role: 'about'
        }, {
            type: 'separator'
        }, {
            label: '服务',
            role: 'services',
            submenu: []
        }, {
            type: 'separator'
        }, {
            label: `隐藏 ${name}`,
            accelerator: 'Command + H',
            role: 'hide'
        }, {
            label: `隐藏其他`,
            role: 'hideothers',
            accelerator: 'Command+Alt+H'
        }, {
            label: '显示所有',
            role: 'unhide'
        }, {
            type: 'separator'
        }, {
            label: `退出`,
            accelerator: 'Command+Q',
            click: () => {
                app.quit()
            }
        }]
    })
}

module.exports.applicationMenu = template

