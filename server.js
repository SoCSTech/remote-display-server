//Firstly import settings
const settings = require('./config/settings.json'); 

const { WebSocketServer } = require('ws');
const crypto = require("crypto");

const { initPing, defaultPingHandler } = require("./src/ping"); 
const { initKeypresses, defaultKeypressHandler } = require('./src/keypresses');

function heartbeat() 
{
    console.log("ping!");
    this.isAlive = true;
}


var lastChar = " ";

let wss = new WebSocketServer({ port: settings.hostPort });

initPing(wss, defaultPingHandler);
initKeypresses(wss, defaultKeypressHandler);

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