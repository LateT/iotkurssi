require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();

// Serve static files from the React app's build directory
const frontendPath = path.join(__dirname, "../frontend/build/");
app.use(express.static(frontendPath));

// API route
app.get("/test", (req, res) => {
    return res.json({ error: false });
});

// Catch-all to serve React app
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Create HTTP server manually
const server = http.createServer(app);

// Attach WebSocket server to HTTP server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (message) => {
        console.log('Received from client:', message.toString());
    });

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
