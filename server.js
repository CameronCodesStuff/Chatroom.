const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const rooms = {};  // Holds rooms and users

wss.on('connection', (ws) => {
    let currentRoom = null;
    let currentUser = null;

    // Listen for messages from the client
    ws.on('message', (message) => {
        const messageData = JSON.parse(message);

        if (messageData.type === 'create') {
            // Create a new room
            rooms[messageData.room] = { users: [] };
            currentRoom = messageData.room;
            currentUser = messageData.user;
            rooms[messageData.room].users.push(ws);
            broadcastMessage(messageData.room, `${currentUser} has joined the room.`, true);
        }

        if (messageData.type === 'join') {
            // Join an existing room
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
            // Handle a normal chat message
            if (currentRoom) {
                const timestamp = new Date().toLocaleTimeString();
                broadcastMessage(currentRoom, messageData.message, false, timestamp);
            }
        }
    });

    // Handle WebSocket disconnection
    ws.on('close', () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].users = rooms[currentRoom].users.filter(user => user !== ws);
            broadcastMessage(currentRoom, `${currentUser} has left the room.`, true);
        }
    });

    // Function to broadcast a message to all users in a room
    function broadcastMessage(room, message, isSystemMessage, timestamp = null) {
        const messageData = {
            room,
            message: message,
            user: isSystemMessage ? 'System' : currentUser,
            timestamp: timestamp || new Date().toLocaleTimeString()
        };
        rooms[room].users.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(messageData));  // Send message to connected clients
            }
        });
    }
});
