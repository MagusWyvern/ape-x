const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const readline = require('readline');

const app = express();

// Static files (for HTML, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// HTTPS options
const options = {
  key: fs.readFileSync('private.key'),
  cert: fs.readFileSync('certificate.crt')
};

// Consider moving logs out of public directory for better security
const LOGS_FILE = path.join(__dirname, 'server/logs.json');

// Function to generate a random incident log
const generateIncidentLog = () => {
  const incidents = ['MONKEY ATTACK'];
  const locations = ['LECTURE THEATRE 2'];
  
  const incident = incidents[Math.floor(Math.random() * incidents.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });
  const date = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  
  return { date, time, incident, location };
};

// Function to save log to file
function saveLogToFile(log, callback) {
  fs.readFile(LOGS_FILE, 'utf8', (err, data) => {
    let logs = [];
    if (!err) {
      try {
        logs = JSON.parse(data);
      } catch (parseError) {
        console.error('Error parsing log file:', parseError);
        // Continue with an empty array if parsing fails
      }
    } else if (err.code !== 'ENOENT') {
      // If error is not 'file not found', callback with error
      return callback(err);
    }
    
    logs.push(log);
    
    fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error saving log:', writeErr);
      }
      callback(writeErr);
    });
  });
}

// Function to generate and save a new log
function generateAndSaveLog() {
  const log = generateIncidentLog();
  saveLogToFile(log, (err) => {
    if (err) {
      console.error('Error saving generated log:', err);
    } else {
      console.log('New log generated:', log);
    }
  });
}

// Generate a new log every half minute
// setInterval(generateAndSaveLog, 30000);

// Endpoint to get the latest log
app.get('/latest-log', (req, res) => {
  fs.readFile(LOGS_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading log:', err);
      return res.status(500).send('Error reading log');
    }
    
    try {
      const logs = JSON.parse(data);
      if (logs.length === 0) {
        return res.status(404).send('No logs found');
      }
      const latestLog = logs[logs.length - 1];
      res.send(`<p>${latestLog.date} [${latestLog.time}] ${latestLog.incident} at ${latestLog.location}</p>`);
    } catch (parseError) {
      console.error('Error parsing log data:', parseError);
      res.status(500).send('Error parsing log data');
    }
  });
});

// Endpoint to get all logs
app.get('/all-logs', (req, res) => {
  fs.readFile(LOGS_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading logs:', err);
      return res.status(500).send('Error reading logs');
    }
    
    try {
      const logs = JSON.parse(data);
      res.json(logs);
    } catch (parseError) {
      console.error('Error parsing log data:', parseError);
      res.status(500).send('Error parsing log data');
    }
  });
});

// Create an HTTPS server
const server = https.createServer(options, app);

server.listen(3000, '0.0.0.0', () => {
  console.log(`Server is now online on port 3000!`);
  console.log(`Use 'ip a' to identify host IP.`);
  console.log('Press "A" to generate a new log on demand.');
  // Generate first log on server start
  generateAndSaveLog();
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

// Set up readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Listen for keypress events
rl.input.on('keypress', (str, key) => {
  if (key.name === 'a' || key.name === 'A') {
    console.log('')
    console.log('Generating new log on demand...');
    generateAndSaveLog();
  }
});

// Enable keypress events
rl.input.setRawMode(true);