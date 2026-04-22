import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { LicenseManager } from './license-manager';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

const currentDir = fileURLToPath(new URL('.', import.meta.url));

let mainWindow: BrowserWindow | undefined;
const licenseManager = LicenseManager.getInstance();

// Configurer les handlers IPC pour la licence
function setupLicenseHandlers() {
  ipcMain.handle('license:getMachineId', () => {
    return licenseManager.getMachineId();
  });

  ipcMain.handle('license:activate', (_event: Electron.IpcMainInvokeEvent, licenseKey: string) => {
    return licenseManager.activateLicense(licenseKey);
  });

  ipcMain.handle('license:validate', () => {
    return licenseManager.validateLicense();
  });

  ipcMain.handle('license:getInfo', () => {
    return licenseManager.getLicenseInfo();
  });

  ipcMain.handle('license:deactivate', () => {
    return licenseManager.deactivateLicense();
  });

  ipcMain.handle(
    'license:generateTrial',
    (_event: Electron.IpcMainInvokeEvent, companyName: string, email: string) => {
      return licenseManager.generateTrialLicense(companyName, email);
    },
  );
}

async function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
        ),
      ),
    },
  });

  // Gérer l'ouverture des nouvelles fenêtres (pour les impressions)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Permettre l'ouverture des fichiers HTML locaux pour l'impression
    if (url.startsWith('file://') || url.includes('.html')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 900,
          height: 700,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
          },
        },
      };
    }
    // Pour les URLs externes, ouvrir dans le navigateur par défaut
    if (url.startsWith('http://') || url.startsWith('https://')) {
      void shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL);
  } else {
    await mainWindow.loadFile('index.html');
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

// Désactiver l'accélération GPU : évite les pages figées (scroll KO mais clavier OK)
// sur certains PC avec pilotes GPU anciens, RDP, ou DPI Windows élevé.
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu-compositing');

void app.whenReady().then(() => {
  setupLicenseHandlers();
  void createWindow();
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    void createWindow();
  }
});
