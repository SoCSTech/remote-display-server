//Firstly import settings
const settings = require('./config/settings.json'); 

//Import logging stuff
const logger = require("winston");
const logging = require("./src/utils/logging");
const chalk = require("chalk");

//Import web socket server
const { WebSocketServer } = require('ws');

//Import utils 
const { initPing, defaultPingHandler } = require("./src/utils/ping"); 
const { initKeypresses, defaultKeypressHandler } = require('./src/utils/keypresses');
const { sendWelcomeMessage } = require('./src/utils/logging');

//Import behaviour
const carousel = require("./src/behaviours/carousel");

function checkForWarnings()
{
    //Send warnings if needed
    if (settings.authorisationToken == "password") 
    {
        // console.clear();
        console.log(chalk.red.bold("WARNING"))
        console.log(chalk.red.bold("The specified authorisation token has not been changed. It is advised that you change this immediately for security purposes."));
        console.log("");
    }
}


function start()
{
    //Initialise logging and send welcome message
    logging.initialise();
    logging.sendWelcomeMessage();

    //Check for config warnings
    checkForWarnings();

    //Make a new server
    let wss = new WebSocketServer({ port: settings.hostPort });
    logging.sendServerStartMessage(wss);
    logging.setUpMessages(wss);

    //Initialise ping & default keypresses
    initPing(wss, defaultPingHandler);
    initKeypresses(wss, defaultKeypressHandler);

    //Call init for carousel
    carousel.initialise(wss);
}

//Start everything up
start();