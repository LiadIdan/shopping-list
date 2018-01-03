const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

let mainWindow;
let addWindow;

// Create main menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click() {
          if (!addWindow) {
            createAddWindow();
          }
          else {
            addWindow.focus();
          }
        }
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      },
    ]
  }
];

// If mac, add empty object to menu
if (process.platform === 'darwin') {
  mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}

app.on('ready', () => {
  // Create new window
  mainWindow = new BrowserWindow({});

  // Load html into window
  mainWindow.loadURL(url.format({
    pathname: path.resolve(__dirname, 'main.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Quit app when closed
  mainWindow.on('closed', () => app.quit());

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow() {
   // Create add window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item'
  });

  // Hide menu
  addWindow.setMenuBarVisibility(false);

  // Disable resizable
  addWindow.setResizable(false);

  // Disable movable
  addWindow.setMovable(false);

  // fixed on top
  addWindow.setAlwaysOnTop(true);
  
   // Load html into window
  addWindow.loadURL(url.format({
    pathname: path.resolve(__dirname, 'add.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Garbage collection handler
  addWindow.on('closed', () => addWindow = null);
}

// Catch item:add
ipcMain.on('item:add', (e, item) => {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});