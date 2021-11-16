const keypress = require("keypress");
const isIterable = (value) => Symbol.iterator in Object(value);

/**
 * Initialises CLI keypresses and responses for this server
 * 
 * @param {*} wss 
 */
function initKeypresses(wss, handlers)
{
    //Keypress setup
    keypress(process.stdin);

    //Set raw mode to true: no enter needed
    process.stdin.setRawMode(true);

    process.stdin.on("keypress", function (ch, key) 
    {
        //Is this an array? If not, just call it like a regular function
        if(!isIterable(handlers))
            return handlers(ch, key);

        //Otherwise, call each handler in turn
        for(let handler of handlers)
            handler(ch, key);
    });
}

/**
 * The default keypress handler for the server
 * 
 * @param {*} ch 
 * @param {*} key 
 */
function defaultKeypressHandler(ch, key)
{
    //Q pressed? exit
    if(ch == "q")
        process.exit(1);
}


module.exports = { initKeypresses, defaultKeypressHandler }