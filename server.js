const express = require('express');
const webPush = require('web-push');
const path = require('path');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser');

const app = express();

// Static files (for HTML, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// VAPID keys (use the ones you generated earlier)
const vapidKeys = {
  privateKey: 'A94232wPdCmriMDMSI74hJ7qLwMY37MA4idyTpVtb5U',
  publicKey: 'BHKeKJ9CI27zfwimUbKUiZawkUq6PVIR3ImvZ5Y58oMmCsMuZLpB8NwkTsC9uYS9_khLKC-sfbYqxyu0GC5lkcE'
};

const options = {
  key: fs.readFileSync('private.key'),
  cert: fs.readFileSync('certificate.crt')
};

webPush.setVapidDetails(
  'mailto:your-email@example.com', 
  vapidKeys.publicKey, 
  vapidKeys.privateKey
);

let subscription;  // Global variable to store subscription object

// Endpoint to receive the subscription object from the client
app.post('/subscribe', (req, res) => {
  subscription = req.body;  // Save the subscription object globally
  res.status(201).json({ message: 'Subscription received' });
});

// Function to send a push notification
const sendNotification = () => {
  if (subscription) {
    const payload = JSON.stringify({
      title: 'Periodic Notification',
      body: 'This is a test message sent every 30 seconds!',
    });

    webPush.sendNotification(subscription, payload)
      .then(response => console.log('Notification sent'))
      .catch(err => console.error('Error sending notification', err));
  } else {
    console.log('No subscription available to send notification to');
  }
};

// Send a notification every 30 seconds
setInterval(sendNotification, 30000);

// Create an HTTPS server
https.createServer(options, app).listen(3000, '0.0.0.0', () => {
  console.log(`Server running on https://172.18.51.69:3000`);
});
