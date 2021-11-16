//Firstly import settings
const settings = require('./config/settings.json'); 

const logger = require("winston");
const logging = require("./src/logging");


const { WebSocketServer } = require('ws');
const crypto = require("crypto");

const { initPing, defaultPingHandler } = require("./src/ping"); 
const { initKeypresses, defaultKeypressHandler } = require('./src/keypresses');
const { sendWelcomeMessage } = require('./src/logging');

//Initialise logging and send welcome message
logging.initialise();
logging.sendWelcomeMessage();


var lastChar = " ";

let wss = new WebSocketServer({ port: settings.hostPort });
logging.setUpMessages(wss);

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