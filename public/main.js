// Function to fetch and append the latest log
function fetchAndAppendLog() {
    fetch('/latest-log')
        .then(response => response.text())
        .then(log => {
            const logsDiv = document.getElementById('logs');
            logsDiv.innerHTML += log;
            logsDiv.scrollTop = logsDiv.scrollHeight;
        })
        .catch(error => console.error('Error fetching log:', error));
}

// Fetch and append a log every minute
setInterval(fetchAndAppendLog, 60000);

// Fetch and append a log immediately when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchAndAppendLog();
});