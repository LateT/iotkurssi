require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');
const { InsertMsgToDB } = require('./dbqueries');
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
wss.on('connection', (ws, req) => {

    // Authentication using JWT tokens
    const params = url.parse(req.url, true);
    const token = params.query.token;

    if (!token) {
        ws.close(1008, "Missing token");
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWTSECRET);
        console.log("Authenticated user connected:", decoded);
        // Authenticated
        ws.on('message', async (message) => {
            console.log('Received from client:', message.toString());
            let data;
            try {
                data = JSON.parse(message);
            } catch (e) {
                console.log("Invalid JSON: ", message.toString());
                return;
            }
            if (isValidSensorMessage(data)) {
                console.log('Valid message:', data);
                // Process valid message
                const result = await InsertMsgToDB(data);
                if (result.error) {
                    console.error(result.message);
                }

            } else {
                console.log('Invalid message types:', data);
            }
        });

        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });
    } catch (err) {
        ws.close(1008, "Invalid token");
    }


});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// Functions

function isValidSensorMessage(msg) {
    // Check if all required fields exist and have correct types
    return (
        typeof msg === 'object' &&
        typeof msg.deviceId === 'string' &&
        typeof msg.temperature === 'number' &&
        typeof msg.humidity === 'number'
    );
}