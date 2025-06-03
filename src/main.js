import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs   from 'node:fs';
import ejs  from 'ejs';

if (started) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false 
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.key.toLowerCase() === 'r') {
        event.preventDefault();
        mainWindow.reload();
      }
    });
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const database = {
  bots: [
    { id: 1, name: 'Hikari', image: '/assets/ComfyUI_01079_.png', gender: "female" },
    { id: 2, name: 'Maria', image: '/assets/ComfyUI_01427_.png', gender: "female" },
    { id: 3, name: 'Georgi', image: '/assets/ComfyUI_01427_.png', gender: "male" },
  ],

  getPageSpecificData: function(pageName) {
    switch (pageName) {
      case 'home':
        return { pageMessage: 'Title message', bots: this.bots };
      default:
        return {};
    }
  }
};

ipcMain.handle('render-template', async (event, relativeTemplatePath, customData = {}) => {
  try {
    const correctTemplatePath = path.join(__dirname, '..', '..', 'src', relativeTemplatePath);

    if (!fs.existsSync(correctTemplatePath)) {
      console.error(`Template not found: ${correctTemplatePath} (requested: ${relativeTemplatePath})`);
      throw new Error(`Template not found: ${relativeTemplatePath}`);
    }
    const templateContent = fs.readFileSync(correctTemplatePath, 'utf-8');

    let dataForEjs = { ...customData };

    if (relativeTemplatePath.startsWith('pages/')) {
      const pageNameForData = relativeTemplatePath.substring(6, relativeTemplatePath.lastIndexOf('.ejs'));
      // console.log('[main.js] Determined pageNameForData:', pageNameForData);

      if (pageNameForData) {
        const pageSpecificData = database.getPageSpecificData(pageNameForData);
        // console.log('[main.js] pageSpecificData for ' + pageNameForData + ':', pageSpecificData);

        if (pageSpecificData) {
          dataForEjs = { ...dataForEjs, ...pageSpecificData };
        }
      }
    }

    dataForEjs.appName = "My chatbot app";
    dataForEjs.currentYear = new Date().getFullYear();

    // console.log(`[main.js] Rendering ${relativeTemplatePath} with final dataForEjs:`, dataForEjs);

    const html = ejs.render(templateContent, dataForEjs);
    return html;
  } catch (error) {
    console.error(`Failed to render template ${relativeTemplatePath}:`, error);
    throw error;
  }
});