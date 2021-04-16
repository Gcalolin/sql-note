import { app, BrowserWindow, Menu, globalShortcut, ipcMain } from 'electron'
const path = require('path')
  
  const { applicationMenu } = require('./applicationMenu.js')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 400,
    useContentSize: true,
    width: 1000,
    minWidth: 400,
    minHeight: 300,
    frame: false,
    titleBarStyle: 'hidden',
    movable: true,
    webPreferences: {
      nodeIntegration: true, // 融合node
      preload: path.resolve(__dirname, './windowType.js')
    }
  })

  mainWindow.loadURL(winURL)

  // 系统菜单
  const menu = Menu.buildFromTemplate(applicationMenu)
  Menu.setApplicationMenu(menu)
  // 注册快捷键
  globalShortcut.register('CommandOrControl+Alt+L', () => {
    mainWindow.webContents.send('addMaster')
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
console.log('dirname', __dirname);

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
