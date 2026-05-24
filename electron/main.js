const { app, BrowserWindow, ipcMain, shell } = require('electron')
const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const BACKEND_PORT = 58080
const BACKEND_JAR_NAME = 'backend-0.0.1-SNAPSHOT.jar'

let mainWindow
let backendProcess

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'QuickLink Dashboard',
    icon: path.join(__dirname, 'quicklink-icon.png'),
    width: 1400,
    height: 900,
    minWidth: 1180,
    minHeight: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }

    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const currentUrl = mainWindow.webContents.getURL()
    if (url !== currentUrl && (url.startsWith('http://') || url.startsWith('https://'))) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  return mainWindow
}

function loadSplashScreen() {
  const splashHtml = `
    <html>
      <body style="margin:0;display:grid;place-items:center;background:#08101c;color:#f8fbff;font-family:Segoe UI,Arial,sans-serif;">
        <div style="text-align:center">
          <div style="font-size:28px;font-weight:700;letter-spacing:-0.03em;">QuickLink Dashboard</div>
          <div style="margin-top:12px;font-size:14px;opacity:0.72;">Starting local services...</div>
        </div>
      </body>
    </html>
  `

  return mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(splashHtml)}`)
}

function getRendererEntry() {
  const devServerUrl = process.env.ELECTRON_RENDERER_URL
  if (devServerUrl) {
    return { type: 'url', value: devServerUrl }
  }

  return {
    type: 'file',
    value: path.join(app.getAppPath(), 'frontend', 'dist', 'index.html'),
  }
}

function getBackendJarPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend', BACKEND_JAR_NAME)
  }

  return path.join(app.getAppPath(), 'backend', 'build', 'libs', BACKEND_JAR_NAME)
}

function getJavaExecutable() {
  const executableName = process.platform === 'win32' ? 'java.exe' : 'java'

  const bundledRuntimePath = app.isPackaged
    ? path.join(process.resourcesPath, 'runtime', 'jre', 'bin', executableName)
    : path.join(app.getAppPath(), 'runtime', 'jre', 'bin', executableName)

  if (require('fs').existsSync(bundledRuntimePath)) {
    return bundledRuntimePath
  }

  return 'java'
}

function startBackend() {
  const backendJarPath = getBackendJarPath()
  const javaExecutable = getJavaExecutable()

  backendProcess = spawn(javaExecutable, ['-jar', backendJarPath], {
    cwd: path.dirname(backendJarPath),
    stdio: 'ignore',
    windowsHide: true,
  })

  backendProcess.on('error', (error) => {
    console.error('Failed to start backend:', error)
  })
}

function waitForBackendReady() {
  return new Promise((resolve, reject) => {
    const maxAttempts = 60
    let attempts = 0

    const tryConnect = () => {
      attempts += 1

      const request = http.get(`http://127.0.0.1:${BACKEND_PORT}/api/links/categories`, (response) => {
        response.resume()
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 500) {
          resolve()
          return
        }

        retryOrFail()
      })

      request.on('error', retryOrFail)
      request.setTimeout(1500, () => {
        request.destroy()
        retryOrFail()
      })
    }

    const retryOrFail = () => {
      if (attempts >= maxAttempts) {
        reject(new Error('Backend did not become ready in time.'))
        return
      }

      setTimeout(tryConnect, 1000)
    }

    tryConnect()
  })
}

async function loadApp() {
  const rendererEntry = getRendererEntry()
  if (rendererEntry.type === 'url') {
    await mainWindow.loadURL(rendererEntry.value)
    return
  }

  await mainWindow.loadFile(rendererEntry.value)
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
}

app.whenReady().then(async () => {
  createWindow()
  await loadSplashScreen()

  startBackend()

  try {
    await waitForBackendReady()
    await loadApp()
  } catch (error) {
    const errorHtml = `
      <html>
        <body style="margin:0;display:grid;place-items:center;background:#08101c;color:#f8fbff;font-family:Segoe UI,Arial,sans-serif;">
          <div style="max-width:540px;padding:32px;text-align:center">
            <div style="font-size:28px;font-weight:700;letter-spacing:-0.03em;">QuickLink Dashboard</div>
            <div style="margin-top:12px;font-size:15px;opacity:0.8;">The local backend could not be started automatically.</div>
            <div style="margin-top:14px;font-size:13px;opacity:0.64;">${error.message}</div>
          </div>
        </body>
      </html>
    `
    await mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(errorHtml)}`)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  stopBackend()

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  stopBackend()
})

ipcMain.handle('open-external-url', async (_event, url) => {
  if (typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    throw new Error('Only http and https URLs can be opened externally.')
  }

  await shell.openExternal(url)
})
