const WebSocket = require('ws');
const http = require('http');

// Create a basic HTTP server (required for Glitch/Render to bind to the port)
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Signaling Server is Running');
});

// Attach WebSocket to the HTTP server
const wss = new WebSocket.Server({ server });

console.log('Signaling server initializing...');

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    // Broadcast the message to all other connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Listen on the environment port (Cloud) or 8080 (Local)
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});