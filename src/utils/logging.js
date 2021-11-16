const logger = require("winston");
const packageDetails = require("../../package.json");
const settings = require("../../config/settings.json");

const Logging = 
{
    initialise()
    {
        //Configure winston's default logger
        //..

        logger.configure
        ({
            level: settings.logging.level,
            format: logger.format.cli(),
            defaultMeta: { service: 'wss' },
            transports: [
                new logger.transports.Console()
            ],
        });
    },

    terminationReasons:
    {
        timeout: "Timed out",
        closed: "Closed by client"
    },

    sendPingSentMessage(wss) 
    {
        logger.debug(`[ping] Sent ping message to ${wss.clients.size} clients.`);
    },

    sendPingReceivedMessage(ws)
    {
        logger.debug(`[pong] Received from ${ws._socket.remoteAddress}`);
    },

    sendClientTerminatedMessage(ws, reason)
    {
        if(ws == undefined)
            logger.info(`[disconnect] Client disconnected (${ws._socket.remoteAddress}, ${reason})`);
        else
            logger.info(`[disconnect] Client disconnected (${reason})`);
    },

    sendServerStartMessage(wss)
    {
        const address = wss.address();

        logger.info(`Started websocket server ${address.address}:${address.port} (${address.family})`);
    },

    sendServerCloseMessage(wss)
    {
        logger.info(`Closed websocket server`);
    },

    setUpMessages(wss)
    {
        wss.on('connection', (ws) => 
        {
            //Call debug
            logger.info(`[connect] Client connected, ${wss.clients.size} in total`)

            //Call on ws close
            ws.on('close', (ws) => 
            {
                //Send terminated message
                this.sendClientTerminatedMessage(ws, this.terminationReasons.closed)

                //And then a little update
                logger.info(`[disconnect] ${wss.clients.size} total clients`);
            });
        });

        //Hook close event
        wss.on('close', (wss) => this.sendServerCloseMessage(wss));
    },

    sendWelcomeMessage()
    {
        logger.info("");
        logger.info(`${packageDetails.name} ${packageDetails.version}`);
        logger.info(`${packageDetails.description}`);
        logger.info("");
        logger.info(`Authored by ${packageDetails.author}`);
        logger.info("");
        logger.info("----------------------------");
        logger.info("Press q at any point to exit");
        logger.info("----------------------------");
        logger.info("");
    }
}


module.exports = Logging;