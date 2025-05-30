require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');
const app = express();
const { InsertMsgToDB, GetDeviceInsights } = require('./dbqueries');

// Serve static files from the React app's build directory
const frontendPath = path.join(__dirname, "../frontend/build/");
app.use(express.static(frontendPath));

// Tämä on tärkeä, jotta express osaa käsitellä JSON-bodyt POST-pyynnöissä
app.use(express.json());

// API route (esim. testaus)
app.get("/test", (req, res) => {
    return res.json({ error: false });
});

// POST endpoint laitetietojen vastaanottoon
app.post('/api/devices/:id/data', async (req, res) => {
    const deviceId = req.params.id;
    const data = req.body;

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: true, message: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.substring(7);

    try {
        jwt.verify(token, process.env.JWTSECRET);
    } catch (err) {
        return res.status(401).json({ error: true, message: 'Invalid token' });
    }

    if (typeof data.temperature !== 'number' || typeof data.humidity !== 'number') {
        return res.status(400).json({ error: true, message: 'Invalid data format' });
    }

    // Varmistetaan, että deviceId tulee URL:stä
    data.deviceId = deviceId;

    try {
        const result = await InsertMsgToDB(data);
        if (result.error) {
            return res.status(500).json({ error: true, message: 'Database error' });
        }
        return res.json({ error: false, message: 'Data inserted successfully' });
    } catch (e) {
        return res.status(500).json({ error: true, message: e.message });
    }
});

// GET endpoint device insights -tietojen hakemiseen
app.get('/api/devices/:id/insights', async (req, res) => {
    console.log('API /api/devices/:id/insights called');
    const deviceId = req.params.id;
    const authHeader = req.headers['authorization'];
    console.log('Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Missing or invalid Authorization header');
        return res.status(401).json({ error: true, message: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, process.env.JWTSECRET);
        console.log("Token decoded:", decoded);

        const insights = await GetDeviceInsights(deviceId);
        if (insights.error) {
            return res.status(404).json(insights);
        }
        return res.json({ error: false, data: insights.data });
    } catch (err) {
        console.log('Invalid token:', err);
        return res.status(401).json({ error: true, message: 'Invalid token' });
    }
});

// Catch-all to serve React app - tämän pitää olla viimeisenä reittinä
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Luo HTTP-serveri
const server = http.createServer(app);

// WebSocket-serverin liittäminen HTTP-serveriin
const wss = new WebSocket.Server({ server });

// WebSocket-yhteyksien käsittely
wss.on('connection', (ws, req) => {

    const params = url.parse(req.url, true);
    const token = params.query.token;

    if (!token) {
        ws.close(1008, "Missing token");
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWTSECRET);
        console.log("Authenticated user connected:", decoded);

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

// Portin käynnistys
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Validointi JSON-viestille WebSocketilta
function isValidSensorMessage(msg) {
    return (
        typeof msg === 'object' &&
        typeof msg.deviceId === 'string' &&
        typeof msg.temperature === 'number' &&
        typeof msg.humidity === 'number'
    );
}