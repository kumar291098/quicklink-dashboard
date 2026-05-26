const { app, BrowserWindow, ipcMain, shell } = require('electron')
const { spawn } = require('child_process')
const http = require('http')
const path = require('path')

const BACKEND_PORT = 58085
const BACKEND_JAR_NAME = 'backend-0.0.1-SNAPSHOT.jar'

let mainWindow
let backendProcess

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'CodingHelp Dashboard',
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
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>CodingHelp Dashboard</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
          color: #f8fbff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
        }
        .container {
          text-align: center;
          max-width: 400px;
          padding: 40px;
        }
        .logo-container {
          position: relative;
          margin-bottom: 28px;
          display: inline-block;
        }
        .logo {
          width: 88px;
          height: 88px;
          animation: pulse 2.2s infinite ease-in-out;
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.45));
          }
          50% {
            transform: scale(1.08);
            filter: drop-shadow(0 0 28px rgba(239, 68, 68, 0.8));
          }
        }
        .title-group {
          margin-bottom: 32px;
        }
        .title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin: 0;
          background: linear-gradient(135deg, #ffffff 40%, #ef4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 4px 0 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .progress-track {
          width: 280px;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          margin: 0 auto 20px;
          overflow: hidden;
          position: relative;
        }
        .progress-bar {
          height: 100%;
          width: 35%;
          background: linear-gradient(90deg, #ff0000, #b91c1c);
          border-radius: 999px;
          box-shadow: 0 0 12px #ff0000;
          position: absolute;
          animation: loading 1.8s infinite ease-in-out;
        }
        @keyframes loading {
          0% {
            left: -40%;
          }
          50% {
            left: 100%;
            width: 35%;
          }
          100% {
            left: 100%;
            width: 0%;
          }
        }
        .status-text {
          font-size: 13px;
          color: #ef4444;
          font-weight: 600;
          opacity: 0.85;
          min-height: 20px;
          letter-spacing: 0.02em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-container">
          <svg class="logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="splash-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FF0000" />
                <stop offset="100%" stop-color="#990000" />
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#splash-gradient)"/>
            <path d="M4 20C4 11.1634 11.1634 4 20 4H44C52.8366 4 60 11.1634 60 20C60 20 48 24 32 24C16 24 4 20 4 20Z" fill="white" fill-opacity="0.08"/>
            <path d="M22 17.5C22 15.7 24 14.6 25.5 15.5L46.5 28C48 28.9 48 31.1 46.5 32L25.5 44.5C24 45.4 22 44.3 22 42.5V17.5Z" fill="white"/>
            <path d="M29 27L26 30L29 33" stroke="#FF0000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M33 27L36 30L33 33" stroke="#FF0000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M32.5 26.5L29.5 33.5" stroke="#FF0000" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="title-group">
          <h1 class="title">CodingHelp</h1>
          <div class="subtitle">Dashboard</div>
        </div>
        <div class="progress-track">
          <div class="progress-bar"></div>
        </div>
        <div id="status" class="status-text">Starting local services...</div>
      </div>

      <script>
        const statuses = [
          "Starting local services...",
          "Warming up Java runtime...",
          "Connecting to database...",
          "Seeding sample links...",
          "Preparing interface layouts...",
          "Optimizing dashboard resources..."
        ];
        let currentIndex = 0;
        const statusEl = document.getElementById('status');
        setInterval(() => {
          currentIndex = (currentIndex + 1) % statuses.length;
          statusEl.textContent = statuses[currentIndex];
        }, 1800);
      </script>
    </body>
    </html>
  `

  return mainWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(splashHtml)}`)
}

function getProjectRoot() {
  return app.isPackaged ? app.getAppPath() : path.join(app.getAppPath(), '..')
}

function getRendererEntry() {
  const devServerUrl = process.env.ELECTRON_RENDERER_URL
  if (devServerUrl) {
    return { type: 'url', value: devServerUrl }
  }

  return {
    type: 'file',
    value: path.join(getProjectRoot(), 'frontend', 'dist', 'index.html'),
  }
}

function getBackendJarPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend', BACKEND_JAR_NAME)
  }

  return path.join(getProjectRoot(), 'backend', 'build', 'libs', BACKEND_JAR_NAME)
}

function getJavaExecutable() {
  const executableName = process.platform === 'win32' ? 'java.exe' : 'java'

  const bundledRuntimePath = app.isPackaged
    ? path.join(process.resourcesPath, 'runtime', 'jre', 'bin', executableName)
    : path.join(getProjectRoot(), 'runtime', 'jre', 'bin', executableName)

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
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Startup Failed - CodingHelp Dashboard</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: radial-gradient(circle at center, #1e1b4b 0%, #090514 100%);
            color: #f8fbff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            overflow: hidden;
          }
          .container {
            text-align: center;
            max-width: 500px;
            padding: 40px;
            background: rgba(15, 23, 42, 0.4);
            border: 1px solid rgba(239, 68, 68, 0.25);
            border-radius: 28px;
            backdrop-filter: blur(16px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          }
          .error-icon {
            width: 64px;
            height: 64px;
            margin-bottom: 24px;
            color: #ef4444;
            filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.5));
          }
          .title {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin: 0 0 12px 0;
            color: #f8fbff;
          }
          .message {
            font-size: 15px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .details {
            font-family: monospace;
            font-size: 13px;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 14px;
            border-radius: 12px;
            color: #f43f5e;
            text-align: left;
            word-break: break-all;
            margin-bottom: 24px;
            max-height: 120px;
            overflow-y: auto;
          }
          .btn-group {
            display: flex;
            justify-content: center;
            gap: 16px;
          }
          .btn {
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 0.88rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
          }
          .btn-secondary {
            background: rgba(255, 255, 255, 0.08);
            color: #f8fbff;
            border: 1px solid rgba(255, 255, 255, 0.15);
          }
          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div class="title">Startup Failed</div>
          <div class="message">The local JVM backend services could not be started automatically. Ensure no other applications are using port 58085.</div>
          <div class="details">${error.message}</div>
          <div class="btn-group">
            <button class="btn btn-secondary" onclick="window.close()">Close App</button>
          </div>
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
