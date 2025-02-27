const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const rooms = {};

wss.on('connection', (ws) => {
    let currentRoom = null;
    let currentUser = null;

    ws.on('message', (message) => {
        const messageData = JSON.parse(message);

        if (messageData.type === 'create') {
            rooms[messageData.room] = { users: [] };
            currentRoom = messageData.room;
            currentUser = messageData.user;
            rooms[messageData.room].users.push(ws);
            broadcastMessage(messageData.room, `${currentUser} has joined the room.`, true);
        }

        if (messageData.type === 'join') {
            if (rooms[messageData.room]) {
                currentRoom = messageData.room;
                currentUser = messageData.user;
                rooms[messageData.room].users.push(ws);
                broadcastMessage(messageData.room, `${currentUser} has joined the room.`, true);
            } else {
                ws.send(JSON.stringify({ error: "Room does not exist." }));
            }
        }

        if (messageData.type === 'message') {
            if (currentRoom) {
                const timestamp = new Date().toLocaleTimeString();
                broadcastMessage(currentRoom, messageData.message, false, timestamp);
            }
        }
    });

    ws.on('close', () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].users = rooms[currentRoom].users.filter(user => user !== ws);
            broadcastMessage(currentRoom, `${currentUser} has left the room.`, true);
        }
    });

    function broadcastMessage(room, message, isSystemMessage, timestamp = null) {
        const messageData = {
            room,
            message: message,
            user: isSystemMessage ? 'System' : currentUser,
            timestamp: timestamp || new Date().toLocaleTimeString()
        };
        rooms[room].users.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageData));
            }
        });
    }
});
