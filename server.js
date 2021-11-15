const { WebSocketServer } = require('ws');
const crypto = require("crypto");
const keypress = require("keypress");

function heartbeat() 
{
    console.log("ping!");
    this.isAlive = true;
}

keypress(process.stdin);

var lastChar = " ";

const wss = new WebSocketServer({ port: 1213 });

wss.on('connection', function connection(ws) 
{
    console.log("connection");

    ws.isAlive = true;
    ws.on('pong', heartbeat);
});

const interval = setInterval(function ping()
{
    wss.clients.forEach(function each(ws) 
    {
        if (ws.isAlive === false)
        {
            console.log("no response. terminating");
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
    });
}, 10000);

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

wss.on('close', function close() 
{
    clearInterval(interval);
});

process.stdin.setRawMode(true);

process.stdin.on("keypress", function (ch, key) 
{    
    lastChar = ch;

    if (ch == "q")
        process.exit(1);
});