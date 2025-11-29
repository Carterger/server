const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Signaling Server is Running');
});

const wss = new WebSocket.Server({ server });

// Map to store userId -> WebSocket connection
const clients = new Map();

console.log('Signaling server initializing...');

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (messageString) => {
    try {
      const message = JSON.parse(messageString);

      // 1. Handle Login
      if (message.type === 'login' && message.payload && message.payload.userId) {
        const userId = message.payload.userId;
        ws.userId = userId; // Store ID on the socket object
        clients.set(userId, ws);
        console.log(`User logged in: ${userId}`);
        return;
      }

      // 2. Handle Targeted Messages
      if (message.target) {
        const targetWs = clients.get(message.target);
        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
          targetWs.send(JSON.stringify(message));
          console.log(`Routed message from ${message.sender} to ${message.target}`);
        } else {
          console.log(`Target user ${message.target} not found or offline`);
        }
      } 
      // 3. Fallback: Broadcast (optional, removed for privacy)
      // else { ... } 
      
    } catch (e) {
      console.error("Error parsing message:", e);
    }
  });

  ws.on('close', () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log(`User disconnected: ${ws.userId}`);
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
