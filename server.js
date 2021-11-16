//Firstly import settings
const settings = require('./config/settings.json'); 

//Import logging stuff
const logger = require("winston");
const logging = require("./src/utils/logging");

//Import web socket server
const { WebSocketServer } = require('ws');

//Import utils 
const { initPing, defaultPingHandler } = require("./src/utils/ping"); 
const { initKeypresses, defaultKeypressHandler } = require('./src/utils/keypresses');
const { sendWelcomeMessage } = require('./src/utils/logging');

//Import behaviour
const carousel = require("./src/behaviours/carousel");

//Initialise logging and send welcome message
logging.initialise();
logging.sendWelcomeMessage();





//Make a new server
let wss = new WebSocketServer({ port: settings.hostPort });
logging.sendServerStartMessage(wss);
logging.setUpMessages(wss);

//Initialise ping & default keypresses
initPing(wss, defaultPingHandler);
initKeypresses(wss, defaultKeypressHandler);


//Call init for carousel
carousel.initialise(wss);


// const dataSendInterval = setInterval(function () 
// {
//     wss.clients.forEach(function (ws) 
//     {
//         ws.send(JSON.stringify
//         ({
//             type: "data",
//             data: lastChar
//         }));
//     })
// }, 500);