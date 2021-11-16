const logger = require("winston");

module.exports = 
{
    initialise(wss)
    {
        //Set web socket server
        this.wss = wss;
        this.interval = setInterval(this.update, 500);

        //Add close event
        this.wss.on('close', (() => this.close(this.wss)).bind(this));

        //Call onConnect callback when connected
        this.wss.on('connection', ((ws) => this.onConnect(ws)).bind(this));
    },

    onConnect(ws)
    {
        //Set disconnect
        ws.on('close', ((ws) => this.onDisconnect(ws)).bind(this));

        logger.info("connect");
    },

    onDisconnect(ws)
    {
        logger.info("disconnect");
    },

    update()
    {
        logger.info("uuuuupdaaaaaaaateeeee");
    },

    close(wss)
    {
        //Clear interval, 
        clearInterval(this.interval);
        this.interval = null;
    }
}