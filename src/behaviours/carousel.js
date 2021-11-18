const logger = require("winston");
const carouselData = require("../../config/carousel.json");
const settings = require("../../config/settings.json");
const chalk = require("chalk");

const carouselOperationModes = [
    {
        key: "random",
        handler: (ws, ctx) =>
        {
            //Find new random id
            const randomID = Math.floor(Math.random() * carouselData.length);

            //Get slide data
            const data = carouselData[randomID];

            //And send it to the display
            ws.send(JSON.stringify(data));

            // logger.debug(`[send] Sent slide ${randomID} to display ${ws.displayID}`);
        }
    },
    
    {
        key: "synchronised",
        handler: (ws, ctx) =>
        {
            //Get slide data
            const data = carouselData[ctx.slideIndex];

            //And send it to the display
            ws.send(JSON.stringify(data));

            // logger.debug(`[send] Sent slide ${ctx.slideIndex} to display ${ws.displayID}`);
        }
    },

    {
        key: "sequential",
        handler: (ws, ctx) =>
        {
            //Offset by this client's ID
            const thisClientIndex = (ctx.slideIndex + ws.displayID) % carouselData.length;

            //Get slide data
            const data = carouselData[thisClientIndex];

            //And send it to the display
            ws.send(JSON.stringify(data));

            // logger.debug(`[send] Sent slide ${thisClientIndex} to display ${ws.displayID}`);
        }
    }
]

module.exports = 
{
    initialise(wss)
    {
        //Set web socket server
        this.wss = wss;
        this.interval = setInterval(this.update.bind(this), settings.carousel.updateInterval);

        //Add close event
        this.wss.on('close', (() => this.close(this.wss)).bind(this));

        //Call onConnect callback when connected
        this.wss.on('connection', ((ws, req) => this.onConnect(ws, req)).bind(this));

        //Slide index
        this.slideIndex = 0;

        //Set client id to 0
        this.newClientID = 0;

        if (!carouselOperationModes.some(x => x.key == settings.carousel.operationMode)) 
        {
            logger.warn(chalk.red(`Warning: Invalid carousel operation mode '${settings.carousel.operationMode}', expected one of: ${carouselOperationModes.map(x => x.key)}`));
            return;
        }
        
        //Otherwise display message 
        // logger.debug(`Initialised carousel in mode '${settings.carousel.operationMode}'`);
    },

    messageAndClose(ws, msg)
    {
        logger.error(msg);
        ws.terminate();
    },

    isValidRequestType(type)
    {
        //Currently there is only one request type
        return (type == "handshake");
    },

    sendSuccess(ws)
    {
        logger.info(`Successfully connected client ${ws._socket.remoteAddress}, display ID ${ws.displayID}.`);

        ws.send(JSON.stringify({
            status: "connected"
        }));
    },

    onConnect(ws, req)
    {
        //Set disconnect
        ws.on('close', ((ws) => this.onDisconnect(ws)).bind(this));


        const ctx = this;

        ws.on('message', (msg) => 
        {
            try
            {
                //Parse
                request = JSON.parse(msg);

                //Does it have a requestType?
                if (!("requestType" in request))
                    return ctx.messageAndClose(ws, `Error: Received message from ${ws._socket.remoteAddress} but no request type passed in payload. Terminating.`);

                //Is it a valid request type?
                if (!ctx.isValidRequestType(request.requestType))
                    return ctx.messageAndClose(ws, `Error: Received unsupported request type '${request.requestType}' from ${ws._socket.remoteAddress}. Terminating.`);

                //Does it have an auth token?
                if (!("payload" in request) || !("authToken" in request.payload))
                    return ctx.messageAndClose(ws, `Error: Received message from ${ws._socket.remoteAddress} but no authentication passed in payload. Terminating.`);

                //Is it a valid auth token?
                if (request.payload.authToken != "sausages")
                    return ctx.messageAndClose(ws, `Error: Authentication token '${request.payload.authToken}' from ${ws._socket.remoteAddress} invalid. Terminating.`);

                //Does it have a display ID? 
                if (!("displayID" in request.payload))
                    return ctx.messageAndClose(ws, `Error: Received message from ${ws._socket.remoteAddress} but no display ID passed in payload. Terminating.`);

                //Is it a valid display ID?
                //..

                //And set displayID
                ws.displayID = request.payload.displayID;

                //Send success message
                ctx.sendSuccess(ws);                
            }
            catch(e)
            {
                logger.error(`An error occurred when receiving a message from ${ws._socket.remoteAddress}.`);
                logger.error("" + e);
                logger.error('Terminating connection.');

                ws.terminate();
            }
        })
        // if(!("displayid" in req.headers))
        // {
        //     //No displayid passed! Get out of here! 
        //     logger.error(`Client ${ws._socket.remoteAddress} tried to connect without passing displayID header. Terminating.`);
        //     ws.terminate();
        // }

        // if (!("authtoken" in req.headers)) 
        // {
        //     //No authtoken passed! Get out of here! 
        //     logger.error(`Client ${ws._socket.remoteAddress} tried to connect without passing any authorisation details. Terminating.`);
        //     ws.terminate();
        // }

        // if(req.headers["authtoken"] != settings.authorisationToken)
        // {
        //     //Invalid authorisation token
        //     logger.error(`Client ${ws._socket.remoteAddress} failed authentication. Terminating.`);
        //     ws.terminate();
        // }

        //Check to see if displayid is valid
        //..

        // const displayIDStr = req.headers["displayid"];
        // const displayID = parseInt(displayIDStr);

        const displayIDStr = "5";
        const displayID = parseInt(displayIDStr);

        if(isNaN(displayID))
        {
            //Invalid authorisation token
            logger.error(`Client ${ws._socket.remoteAddress} tried connecting with invalid displayID ${displayIDStr}. Must be an integer. Terminating.`);
            ws.terminate();
        }

        if ([...this.wss.clients].some(x => x.displayID == displayID))
        {
            //Invalid authorisation token
            logger.error(`Client ${ws._socket.remoteAddress} tried connecting with displayID ${displayIDStr}, but it already exists. Terminating.`);
            ws.terminate();
        }

        ws.displayID = displayID;
    },

    onDisconnect(ws)
    {
        // logger.info("disconnect");
    },

    update()
    {
        //Invalid operation mode? Get out of here bro
        if (!carouselOperationModes.some(x => x.key == settings.carousel.operationMode)) 
            return;

        //Otherwise, find the operation mode handler
        const handlerFunc = carouselOperationModes.find(x => x.key == settings.carousel.operationMode).handler;

        //Compute new slide index for some modes
        this.slideIndex = (this.slideIndex + 1) % carouselData.length;
        
        //Save this to ctx
        const ctx = this;

        //Just run handler func on every clint
        this.wss.clients.forEach((ws) =>
        {
            handlerFunc(ws, ctx);
        });
    },

    close(wss)
    {
        //Clear interval, 
        clearInterval(this.interval);
        this.interval = null;
    }
}