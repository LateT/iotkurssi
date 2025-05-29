const WebSocket = require('ws');

const WS_URL = 'ws://localhost:3000';

let ws;
let isConnected = false;
const messageBuffer = [];


function sendMessage(message) {
  const json = JSON.stringify(message);

  if (isConnected && ws.readyState === WebSocket.OPEN) {
    ws.send(json);
    console.log('Sent:', message);
  } else {
    messageBuffer.push(json);
    console.log('Buffered:', message);
  }
}

// Try to reconnect periodically if disconnected
function connect() {
  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    isConnected = true;
    console.log('Connected to WebSocket server');

    // Flush buffered messages
    while (messageBuffer.length > 0) {
      const msg = messageBuffer.shift();
      ws.send(msg);
      console.log('Flushed:', JSON.parse(msg));
    }
  });

  ws.on('close', () => {
    isConnected = false;
    console.log('WebSocket disconnected, retrying in 3s...');
    setTimeout(connect, 3000);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
}

connect();

// Send emulated sensor data every second
setInterval(() => {
  const data = {
    deviceId: 'Raspberry Pi Web Client',
    temperature: 0 + Math.random() * 35, // 0 - 35 C
    humidity: 40 + Math.random() * 30, // 40-70 %
    timestamp: Date.now()
  };

  sendMessage(data);
}, 1000);
