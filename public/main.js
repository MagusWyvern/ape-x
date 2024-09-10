// Function to fetch and append the latest log
function fetchAndAppendLatestLog() {
    fetch('/latest-log')
        .then(response => response.text())
        .then(log => {
            const logsDiv = document.getElementById('logs');
            logsDiv.innerHTML = ''
            logsDiv.innerHTML += log;
            logsDiv.scrollTop = logsDiv.scrollHeight;
        })
        .catch(error => console.error('Error fetching log:', error));
}

// Function to load all existing logs
function loadAllLogs() {
    fetch('/all-logs')
        .then(response => response.json())
        .then(logs => {
            const logsDiv = document.getElementById('logs');
            logsDiv.innerHTML = ''
            logs.forEach(log => {
                logsDiv.innerHTML += `<p>${log.date} [${log.time}] ${log.incident} detected at ${log.location}!</p>`;
            });
            logsDiv.scrollTop = logsDiv.scrollHeight;
        })
        .catch(error => console.error('Error loading logs:', error));
}

// Fetch the latest log every minute
setInterval(loadAllLogs, 30000);

// Load all existing logs and fetch the latest log when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadAllLogs();
    // fetchAndAppendLatestLog();
});