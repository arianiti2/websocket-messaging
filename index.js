const express = require('express');
const path = require('path');
const {WebSocketServer, WebSocket} = require('ws');

const WS_PORT = 8000;
const wss = new WebSocketServer({port: WS_PORT});
wss.on('listening', () => {
    console.log(`Websocket Server on port ${WS_PORT}`)
})

wss.on('connection', function (ws) {
    ws.on('error', (error) => {
        console.error(error);
    });

    ws.on('message', function (data) {
        let jsonData = JSON.parse(data);

        if (jsonData.name) {
            // When a user connects and provides their name
            console.log(`${jsonData.name} has connected`);
            ws.name = jsonData.name;

            // Notify all other clients of the new connection
            wss.clients.forEach(function (client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ announcement: `${ws.name} has joined.` }));
                }
            });
        } else if (jsonData.message) {
            // When a user sends a message
            wss.clients.forEach(function (client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ name: ws.name, message: jsonData.message }));
                }
            });
        }
    });

    ws.on('close', function () {
        console.log(`${ws.name} has left.`);
        wss.clients.forEach(function (client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ announcement: `${ws.name} has left.` }));
            }
        });
    });
});


const app = express();

const EXPRESS_PORT = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.listen(EXPRESS_PORT, () => {
    console.log(`Express server on port ${EXPRESS_PORT}`);
})