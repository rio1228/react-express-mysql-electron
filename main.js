/**
 * Created by Ryo Mikami on 2017/08/10.
 */
// import React from 'react'
// import ReactDOM from  'react-dom'
//
// const dom = <div> {/*この中にコンポーネントを配置*/} </div>
// ReactDOM.render(dom, document.getElementById('root'))

const electron = require('electron')
// Module to control application life.
const express = require("express");
const app = express();
const portNo = 3000
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
//プロセス間通信をするためのもの
const {ipcMain} = require('electron');
const path = require('path')
const url = require('url')
const ip_address = '127.0.0.1'
app.listen(portNo, ip_address);
//開発中のディレクトリ構造
//開発中はこれをコメントから外す
// app.use(express.static("./"));
// ビルド後のディレクトリ構造
// 開発中はコメントアウトする
app.use(express.static("./resources/app/"));
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// Electronのライフサイクルを定義
let mainWindow //メインウィンドウを表す変数

// ウィンドウを作成してコンテンツを読み込む
function createWindow () {

    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600})

    // and load the index.html of the app.
    mainWindow.loadURL(`http://${ip_address}:${portNo}/`)

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', electron.app.quit)
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron.app.on('ready', createWindow)

// Quit when all windows are closed.
electron.app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron.app.quit()
    }
})

electron.app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// 非同期プロセス通信
//レンダラプロセスから呼び出される
ipcMain.on('async',( event, args ) =>{
    console.log( args );
    const mysql = require('mysql');
    const connection = mysql.createConnection({
        host : 'localhost',
        user : 'root',
        password : '',
        port : 3306,
        database: 'taiken'
    });
    connection.connect();
    connection.query('SELECT * from kyak LIMIT 10;', (err, rows, fields) => {
        if (err) throw err;

        // レンダラプロセスへ送る
        event.sender.send('async-reply', rows);
    });
});