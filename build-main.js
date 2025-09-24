const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Building main process...');
  
  // Ensure dist directory exists
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // If you have a TypeScript main file, compile it
  if (fs.existsSync('main.ts')) {
    console.log('Compiling TypeScript main file...');
    execSync('npx tsc main.ts --outDir dist --target es2020 --module commonjs', { stdio: 'inherit' });
  }
  // If you have a JavaScript main file, copy it
  else if (fs.existsSync('main.js')) {
    console.log('Copying JavaScript main file...');
    fs.copyFileSync('main.js', 'dist/main.js');
  }
  // If you have electron directory structure
  else if (fs.existsSync('electron/main.js')) {
    console.log('Copying electron main file...');
    fs.copyFileSync('electron/main.js', 'dist/main.js');
  }
  else if (fs.existsSync('electron/main.ts')) {
    console.log('Compiling electron TypeScript main file...');
    execSync('npx tsc electron/main.ts --outDir dist --target es2020 --module commonjs', { stdio: 'inherit' });
  }
  else {
    console.log('No main file found, creating basic main.js...');
    const basicMain = `
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    win.loadURL('http://localhost:3001');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../out/index.html'));
  }

  // Debug: log when page loads
  win.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  // Debug: log any errors
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });
}

app.whenReady().then(() => {
  console.log('Electron app ready, creating window...');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
`;
    fs.writeFileSync('dist/main.js', basicMain);
  }
  
  console.log('Main process build complete');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}