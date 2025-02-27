// Function to send a message
function sendMessage() {
    const message = messageInput.value.trim();
    if (message !== '') {
        const timestamp = new Date().toLocaleTimeString();
        const messageData = {
            type: 'message',  // Make sure this message is marked as a regular chat message
            user: username,
            message: message,
            room: currentRoom,
            timestamp: timestamp
        };
        socket.send(JSON.stringify(messageData));  // Send message to WebSocket server
        messageInput.value = '';  // Clear the input
    }
}
