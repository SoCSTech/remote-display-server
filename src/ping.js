const settings = require('../config/settings.json');
const logging = require('./logging');

/**
 * Initialises a web socket server with keep alive / ping-pong
 * functionality.
 * 
 * @param {*} wss 
 */
function initPing(wss, cb)
{
    //Add a listener: on connection, set a flag to true
    //and call keep alive function on pong
    //..

    wss.on('connection', function(ws) 
    {
        //Initially, the connection is alive
        ws.isAlive = true;

        //Call ping function
        ws.on('pong', () => cb(wss, ws));
    });

    //Set up an interval: ping every client every X seconds
    //..

    wss.pingInterval = setInterval(function() 
    {
        wss.clients.forEach(function(ws) 
        {
            //Run through each client, if it is not alive,
            //then terminate it
            //..

            if (ws.isAlive == false) 
            {
                logging.sendClientTerminatedMessage(ws, logging.terminationReasons.timeout);
                return ws.terminate();
            }

            //Set is alive to false, ping
            ws.isAlive = false;
            ws.ping();
        });

        if(wss.clients.size > 0)
            logging.sendPingSentMessage(wss);

    }, settings.pingInterval);


    //Add a listener: on exit, terminate ping interval
    //..

    wss.on('close', function close() 
    {
        //Ping interval doesnt exist? Clear interval
        if(wss.pingInterval != undefined)
            clearInterval(wss.pingInterval);
    });
}


/**
 * The default ping handler, simply sets is alive to true and
 * thats it
 * 
 * @param {*} wss 
 */
function defaultPingHandler(wss, ws)
{
    //Call ping log function
    logging.sendPingReceivedMessage(ws);

    //Set alive to true
    ws.isAlive = true;
}

module.exports = { initPing, defaultPingHandler }