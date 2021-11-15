//Firstly import settings
const settings = require('./config/settings.json'); 

const { WebSocketServer } = require('ws');
const crypto = require("crypto");
const keypress = require("keypress");
const { initPing, defaultPingHandler } = require("./src/ping"); 

function heartbeat() 
{
    console.log("ping!");
    this.isAlive = true;
}

keypress(process.stdin);

var lastChar = " ";

let wss = new WebSocketServer({ port: settings.hostPort });

initPing(wss, defaultPingHandler);


const dataSendInterval = setInterval(function () 
{
    wss.clients.forEach(function (ws) 
    {
        ws.send(JSON.stringify
        ({
            type: "data",
            data: lastChar
        }));
    })
}, 500);



process.stdin.setRawMode(true);

process.stdin.on("keypress", function (ch, key) 
{    
    lastChar = ch;

    if (ch == "q")
        process.exit(1);
});