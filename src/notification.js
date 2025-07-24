// A key to store the date of the last notification in the browser's memory
const LAST_NOTIFICATION_KEY = 'proverb_last_notification_date';

// 1. Function to ask for permission
export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission not granted.');
  }
}

// 2. Function to check if we should notify the user today
export async function checkAndSendDailyNotification(proverbText, proverbRef) {
  // Check for permission first
  if (Notification.permission !== 'granted') {
    console.log('Notification permission has not been granted.');
    return;
  }
  
  const today = new Date().toLocaleDateString(); // e.g., "7/18/2024"
  const lastNotified = localStorage.getItem(LAST_NOTIFICATION_KEY);

  // If we haven't notified today, send one!
  if (today !== lastNotified) {
    console.log('Sending daily notification...');
    
    // Get the Service Worker registration from the PWA plugin
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.error('Service Worker not found.');
      return;
    }

    // Use the Service Worker to show the notification
    // This is better because it can work even if the app tab isn't active
    registration.showNotification('Your Proverb of the Day', {
      body: `${proverbText} - ${proverbRef}`,
      icon: '/pwa-192x192.png' // Icon must be in the public folder
    });

    // Remember that we notified today
    localStorage.setItem(LAST_NOTIFICATION_KEY, today);
  } else {
    console.log('Already notified today.');
  }
}