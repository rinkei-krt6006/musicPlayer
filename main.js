const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain

let mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  const Screen = electron.screen
  const size = Screen.getPrimaryDisplay().size
  let mainWindow = new BrowserWindow({
    width: size.width, 
    height: size.height,
    'fullscreen': false, 
    'node-integration': false,
    'transparent': true,//透過
    'frame': false,//上のexitボタンとか出るバー
    'resizable': true,//リサイズ禁止
    //'toolbar': false,
    'title':'ayaPlayer',
    'icon':'./pic/icon/ic_navigate_next_black_48dp.png',
    'parent':true
/*
parent BrowserWindow（オプション） - 親ウィンドウを指定します。 デフォルトはnullです。
acceptFirstMouse Boolean（オプション） - Webビューがウィンドウを同時にアクティブにする単一のマウスダウンイベントを受け入れるかどうか。 デフォルトはfalseです。
*/
  });
//  mainWindow.setIgnoreMouseEvents(true)
  mainWindow.loadURL('file://' + __dirname + '/index.html')
  mainWindow.on('closed', function() {
    mainWindow = null
  });
})
