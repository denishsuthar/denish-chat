const { app, BrowserWindow } = require("electron");
const path = require("path");
const express = require("express");
const cors = require("cors");
const localServerApp = express();
const PORT = 8088;
const startLocalServer = (done) => {
  localServerApp.use(express.json({ limit: "100mb" }));
  localServerApp.use(cors());
  localServerApp.use(express.static("./build/"));
  localServerApp.listen(PORT, async () => {
    console.log("Server Started on PORT ", PORT);
    done();
  });
};

localServerApp.get("/chat", (req, res) => {
 express.static("./build/")
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    icon: __dirname + "/favicon.ico",
    autoHideMenuBar: true,
  });

  mainWindow.loadURL("http://localhost:" + PORT);


  mainWindow.flashFrame(true)
 
}

if (process.platform === "win32") {
  app.setAppUserModelId("v2 Web Solutions");
}

app.whenReady().then(() => {
  startLocalServer(createWindow);

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
