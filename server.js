//Firstly import settings
const settings = require('./config/settings.json'); 

//Import logging stuff
const logger = require("winston");
const logging = require("./src/utils/logging");


const { WebSocketServer } = require('ws');
const crypto = require("crypto");

const { initPing, defaultPingHandler } = require("./src/utils/ping"); 
const { initKeypresses, defaultKeypressHandler } = require('./src/utils/keypresses');
const { sendWelcomeMessage } = require('./src/utils/logging');

//Initialise logging and send welcome message
logging.initialise();
logging.sendWelcomeMessage();


var lastChar = " ";

let wss = new WebSocketServer({ port: settings.hostPort });
logging.sendServerStartMessage(wss);
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