const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();

// Static files (for HTML, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

const options = {
  key: fs.readFileSync('private.key'),
  cert: fs.readFileSync('certificate.crt')
};

// Function to generate a random incident log
const generateIncidentLog = () => {
  const incidents = ['MONKEY ATTACK'];
  const locations = ['DINING HALL', 'RESOURCE CENTER', 'VILLA A', 'VILLA B', 'VILLA C', 'VILLA D', 'VILLA E', 'QUAD', 'LECTURE HALL', 'GYM', 'GREAT HALL'];
  
  const incident = incidents[Math.floor(Math.random() * incidents.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  const date = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  
  return `<p>${date} [${time}] ${incident} at ${location}</p>`;
};

// Endpoint to get the latest log
app.get('/latest-log', (req, res) => {
  res.send(generateIncidentLog());
});

// Create an HTTPS server
https.createServer(options, app).listen(3000, '0.0.0.0', () => {
  console.log(`Server is now online on port 3000!`);
  console.log(`Use 'ip a' to identify host IP.`)
});