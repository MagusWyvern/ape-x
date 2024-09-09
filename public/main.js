function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

document.getElementById('subscribe').addEventListener('click', () => {
    // Check if the user has granted permission for notifications
    if (Notification.permission === 'granted') {
        subscribeUser();
    } else if (Notification.permission === 'denied') {
        console.log('Notification permission denied.');
    } else {
        // Request permission from the user
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                subscribeUser();
            } else {
                console.log('Notification permission denied.');
            }
        });
    }
});

function subscribeUser() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
        return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BHKeKJ9CI27zfwimUbKUiZawkUq6PVIR3ImvZ5Y58oMmCsMuZLpB8NwkTsC9uYS9_khLKC-sfbYqxyu0GC5lkcE')
        });
    }).then(function(subscription) {
        // Send subscription to the server
        return fetch('/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });
    }).catch(function(error) {
        console.error('Failed to subscribe the user: ', error);
    });
}
