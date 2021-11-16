const logger = require("winston");
const carouselData = require("../../config/carousel.json");
const settings = require("../../config/settings.json");

module.exports = 
{
    initialise(wss)
    {
        //Set web socket server
        this.wss = wss;
        this.interval = setInterval(this.update.bind(this), 500);

        //Add close event
        this.wss.on('close', (() => this.close(this.wss)).bind(this));

        //Call onConnect callback when connected
        this.wss.on('connection', ((ws, req) => this.onConnect(ws, req)).bind(this));

        //Slide index
        this.slideIndex = 0;

        //Set client id to 0
        this.newClientID = 0;
    },

    onConnect(ws, req)
    {
        //Set disconnect
        ws.on('close', ((ws) => this.onDisconnect(ws)).bind(this));

        //Set client index
        ws.carouselIndex = this.newClientID++;

        if(!("displayid" in req.headers))
        {
            //No displayid passed! Get out of here! 
            logger.error(`Client ${ws._socket.remoteAddress} tried to connect without passing displayID header. Terminating.`);
            ws.terminate();
        }

        if (!("authtoken" in req.headers)) 
        {
            //No displayid passed! Get out of here! 
            logger.error(`Client ${ws._socket.remoteAddress} tried to connect without passing any authorisation details. Terminating.`);
            ws.terminate();
        }

        if(req.headers("authtoken") != settings.authorisationToken)
        {
            //No displayid passed! Get out of here! 
            logger.error(`Client ${ws._socket.remoteAddress} failed authentication. Terminating.`);
            ws.terminate();
        }
    },

    onDisconnect(ws)
    {
        logger.info("disconnect");
    },

    update()
    {
        //Compute new slide index
        this.slideIndex = (this.slideIndex + 1) % carouselData.length;
        
        //Save this to ctx
        const ctx = this;

        this.wss.clients.forEach((ws, index) => 
        {
            //Offset by this client's ID
            const thisClientIndex = (this.slideIndex + ws.carouselIndex) % carouselData.length;

            //Get slide data
            const data = carouselData[thisClientIndex];

            //And send it to the display
            ws.send(JSON.stringify(data));

            logger.debug(`[send] Send slide ${thisClientIndex} to client ${ws.carouselIndex}`);
        })
    },

    close(wss)
    {
        //Clear interval, 
        clearInterval(this.interval);
        this.interval = null;
    }
}