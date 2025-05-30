const WebSocket = require('ws');
const fs = require('fs');
require('dotenv').config();
const WS_URL = 'wss://iotserver-akf8hwcae6ggg5af.swedencentral-01.azurewebsites.net?token=' + process.env.TOKEN;
//const WS_URL = 'ws://localhost:3000?token=' + process.env.TOKEN;
console.log(WS_URL);
let ws;
let isConnected = false;
const messageBuffer = [];

const StoreMsg = (message) => {
  // Append each message as a JSON line
  fs.appendFile('sensor_data.log', JSON.stringify(message) + '\n', (err) => {
    if (err) console.error('Cold storage error:', err);
  });
}

function sendMessage(message) {
  StoreMsg(message);
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
  // Do not change the order of values in the object !!
  const data = {
    deviceId: 'RaspberryPiWebClient',
    temperature: 0 + Math.random() * 35, // 0 - 35 C
    humidity: 40 + Math.random() * 30, // 40-70 %
  };

  sendMessage(data);
}, 1000);
