// Keys for storing data in the browser's local memory
const TIME_KEY = 'proverb_notification_time'
const LAST_NOTIFICATION_KEY = 'proverb_last_notification_date'

/**
 * Asks the user for permission to send notifications.
 */
export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.')
  }
}

/**
 * Checks if a scheduled notification should be sent today.
 * @param {string} proverbText The text of the proverb.
 * @param {string} proverbRef The reference of the proverb.
 */
export async function checkAndSendScheduledNotification(proverbText, proverbRef) {
  // 1. Check for permission. If not granted, do nothing.
  if (Notification.permission !== 'granted') return

  // 2. Get the user's saved time preference. If they haven't set one, do nothing.
  const scheduledTime = localStorage.getItem(TIME_KEY) // e.g., "08:00" or "20:00"
  if (!scheduledTime) return

  // 3. Get the last date we sent a notification.
  const lastNotified = localStorage.getItem(LAST_NOTIFICATION_KEY)
  const today = new Date().toLocaleDateString()

  // 4. If we've already sent one today, do nothing.
  if (lastNotified === today) {
    console.log('Already notified today.')
    return
  }

  // 5. THE CORE LOGIC: Check if the scheduled time has passed for today.
  const [hour, minute] = scheduledTime.split(':').map(Number)
  const now = new Date()
  const scheduledDate = new Date()
  scheduledDate.setHours(hour, minute, 0, 0)

  // If the current time is past the scheduled time for today...
  if (now >= scheduledDate) {
    console.log('Scheduled time has passed for today. Sending notification!')

    // Get the Service Worker registration to show the notification.
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      console.error('Service Worker is not available.')
      return
    }

    // Show the notification.
    await registration.showNotification('Your Proverb of the Day', {
      body: `"${proverbText}" - ${proverbRef}`,
      icon: '/android.png', // Icon must be in your 'public' folder.
    })

    // IMPORTANT: Remember that we sent a notification today.
    localStorage.setItem(LAST_NOTIFICATION_KEY, today)
  } else {
    console.log('Scheduled time for today has not passed yet.')
  }
}
