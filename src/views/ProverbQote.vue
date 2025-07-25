<script setup>
import { ref, onMounted } from 'vue'
// import { requestNotificationPermission, checkAndSendDailyNotification } from '../notification.js';
import {
  requestNotificationPermission,
  checkAndSendScheduledNotification,
} from '../notification.js'

// --- STATE ---
const currentVerse = ref({ text: '', reference: '' })
const allChapters = ref([])
const isLoading = ref(false)
const error = ref(null)
const notificationTime = ref('')
const notificationsEnabled = ref(false)
const isScheduling = ref(false)
// --- FUNCTIONS ---

// Add this function anywhere inside your <script setup> block

async function enableNotifications() {
  try {
    await requestNotificationPermission()
    notificationsEnabled.value = true
    isScheduling.value = true
    alert(
      'Notifications have been enabled! You will receive a proverb the first time you open the app each day after your chosen time.',
    )
  } catch (err) {
    alert(
      'Failed to enable notifications. Please check your browser settings and allow notifications for this site.',
    )
  }
}

async function fetchProverbsData() {
  isLoading.value = true
  error.value = null

  try {
    const apiUrl = `https://raw.githubusercontent.com/kirube1992/proverb-api-data/refs/heads/main/db.json`

    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error('Could not fetch the proverbs database from GitHub.')
    }

    const data = await response.json()

    // This is a key check. Does the downloaded data have a 'chapters' array?
    if (!data.chapters || !Array.isArray(data.chapters)) {
      throw new Error("Database format is incorrect. The 'chapters' array was not found.")
    }

    // If the check passes, store the chapters.
    allChapters.value = data.chapters

    // After successfully loading and storing the data, display a verse.
    displayVerseOfTheDay()

    // await checkAndSendDailyNotification(currentVerse.value.text, currentVerse.value.reference);
  } catch (err) {
    console.error('Error during fetch or data processing:', err)
    error.value = 'Sorry, a critical error occurred while loading the proverbs.'
  } finally {
    isLoading.value = false
  }
}

function displayVerseOfTheDay() {
  if (allChapters.value.length === 0) {
    // This function can't run if there's no data.
    return
  }

  const today = new Date()
  const dayOfMonth = today.getDate()

  // Find today's chapter from the data we stored.
  const todaysChapter = allChapters.value.find((chap) => Number(chap.chapter) === dayOfMonth)

  if (!todaysChapter) {
    error.value = `No proverbs found in the database for day ${dayOfMonth}.`
    return
  }

  // Pick a random verse from today's chapter.
  const verseCount = todaysChapter.verses.length
  const randomIndex = Math.floor(Math.random() * verseCount)
  const randomVerseText = todaysChapter.verses[randomIndex]

  // Update the UI.
  currentVerse.value = {
    text: randomVerseText,
    reference: `ምሳሌ ${todaysChapter.chapter}:${randomIndex + 1}`,
  }

  checkAndSendScheduledNotification(currentVerse.value.text, currentVerse.value.reference)
}

function saveNotificationTime() {
  if (!notificationTime.value) {
    alert('Please select a time.')
    return
  }
  // Store the selected time (e.g., "08:00") in the browser's memory
  localStorage.setItem('proverb_notification_time', notificationTime.value)
  alert(`Notification time saved for ${notificationTime.value}!`)

  isScheduling.value = false
}

// Add this new function to your script
function editNotificationTime() {
  // Simply open the scheduler UI again
  isScheduling.value = true
}

// --- LIFECYCLE HOOK ---
onMounted(() => {
  fetchProverbsData()
  const savedTime = localStorage.getItem('proverb_notification_time')
  if (savedTime) {
    notificationTime.value = savedTime
  }
  // const wereEnabled = localStorage.getItem('proverb_notifications_enabled');
  if (Notification.permission === 'granted') {
    notificationsEnabled.value = true
  }
})
</script>
<template>
  <div class="page-container">
    <div class="proverb-quote">
      <h2>Proverb of the day</h2>
      <div v-if="isLoading">
        <p>Loading...</p>
      </div>
      <div v-else-if="error">
        <p class="error">{{ error }}</p>
      </div>
      <div v-else>
        <p>"{{ currentVerse.text }}"</p>
        <cite>{{ currentVerse.reference }}</cite>
      </div>
      <div>
        <button @click="displayVerseOfTheDay" :disabled="isLoading">
          {{ isLoading ? 'Loading...' : 'Get new Verse' }}
        </button>
        <button v-if="!notificationsEnabled" @click="enableNotifications" class="notification-btn">
          Enable Daily Notifications
        </button>

        <button
          v-if="notificationsEnabled && !isScheduling"
          @click="editNotificationTime"
          class="notification-btn"
        >
          Edit Notification Time
        </button>
      </div>
      <div v-if="isScheduling" class="schedule-section">
        <label for="notification-time">Notify me daily at:</label>
        <input id="notification-time" type="time" v-model="notificationTime" />
        <button @click="saveNotificationTime">Save Time</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.page-container {
  display: flex;
  justify-content: center; /* horizontal center */
  align-items: center; /* vertical center */
  min-height: 100vh; /* full screen height */
  padding: 20px; /* fallback padding */
  box-sizing: border-box;
}

/* ... keep your existing .page-container and .proverb-quote styles ... */
/* ... keep your p, and cite styles ... */

.main-actions {
  display: flex;
  justify-content: center;
  /* gap: 45px; Adds space between the buttons */
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  color: white;
  background-image: linear-gradient(to right, #da4453, #89216b);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.notification-btn {
  background-image: linear-gradient(to right, #6a3093, #a044ff);
  margin: 20px 20px;
}

/* --- THE NEW, BEAUTIFUL SCHEDULER STYLES --- */
.schedule-section {
  margin-top: 30px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.2); /* Semi-transparent background */
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px; /* Space between items */
  animation: fadeIn 0.5s ease; /* Nice fade-in animation */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.schedule-section label {
  font-size: 16px;
  font-weight: 500;
}

.schedule-section input[type='time'] {
  border: 1px solid #ffffff55;
  background-color: transparent;
  color: white;
  padding: 8px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 16px;
}

/* Styles for the time picker icon in Chrome/Edge */
.schedule-section input[type='time']::-webkit-calendar-picker-indicator {
  filter: invert(1); /* Makes the little clock icon white */
}

.proverb-quote {
  background-image: linear-gradient(#b47f24, #b134db);
  max-width: 800px;
  text-align: center;
  border: 1px solid #2c7ca0;
  border-radius: 8px;
  padding: 35px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.schedule-section {
  display: flex;
  justify-content: space-around;
}

p {
  font-size: 1.2em;
  margin: 15px 0;
}

cite {
  font-style: italic;
  display: block;
  margin-top: 10px;
}

button {
  margin-top: 20px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 400;
  background-image: linear-gradient(#cd09a2, #a9431e);
  color: white;
}

button:hover {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

.btn1 {
  margin-left: 5px;
}
</style>
