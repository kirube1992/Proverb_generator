<script setup>
import { ref, onMounted } from 'vue'
import {
  requestNotificationPermission,
  checkAndSendScheduledNotification,
} from '../notification.js'

// --- STATE ---
const currentVerse = ref({ text: '', reference: '' })
const allChapters = ref([])
const smartProverbs = ref([]) // Standardized to plural
const availableProverbs = ref([])

const isLoading = ref(false)
const error = ref(null)
const notificationTime = ref('')
const notificationsEnabled = ref(false)
const isScheduling = ref(false)

// --- FUNCTIONS ---

// Renamed and corrected function
function processProverbsIntoThoughts(chaptersArray) {
  const allThoughts = []

  // FIX #2: Use a different name for the loop variable to avoid shadowing
  chaptersArray.forEach((chapterObject) => {
    let currentThought = ''
    let startVerse = 1

    chapterObject.verses.forEach((verseText, index) => {
      currentThought += verseText + ' '

      // FIX #1: Correct spelling of 'endsWith'
      if (verseText.trim().endsWith('።')) {
        allThoughts.push({
          text: currentThought.trim(),
          reference: `ምሳሌ ${chapterObject.chapter}:${startVerse}-${index + 1}`,
        })
        currentThought = ''
        startVerse = index + 2
      }
    })
  })

  smartProverbs.value = allThoughts
  availableProverbs.value = [...allThoughts]
  console.log(`Processed into ${smartProverbs.value.length} smart proverbs.`)
}

async function fetchProverbsData() {
  isLoading.value = true
  error.value = null
  try {
    // const apiUrl = `https://raw.githubusercontent.com/kirube1992/final-proverb-db/main/db.json`
    const apiUrl = `https://raw.githubusercontent.com/kirube1992/proverb-api-data/refs/heads/main/db.json`
    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error('Could not fetch the proverbs database.')

    const data = await response.json()
    if (!data.chapters || !Array.isArray(data.chapters))
      throw new Error('Database format is incorrect.')

    allChapters.value = data.chapters
    processProverbsIntoThoughts(allChapters.value)
    displayVerseOfTheDay()
  } catch (err) {
    console.error('Error during fetch or data processing:', err)
    error.value = 'Sorry, a critical error occurred while loading the proverbs.'
  } finally {
    isLoading.value = false
  }
}

function displayVerseOfTheDay() {
  if (availableProverbs.value.length === 0) {
    if (smartProverbs.value.length > 0) {
      console.log('All proverbs shown. Resetting the list.')
      availableProverbs.value = [...smartProverbs.value]
    } else {
      return
    }
  }

  const randomIndex = Math.floor(Math.random() * availableProverbs.value.length)
  const randomThought = availableProverbs.value[randomIndex]

  currentVerse.value = {
    text: randomThought.text,
    reference: randomThought.reference,
  }

  availableProverbs.value.splice(randomIndex, 1)
  console.log(`${availableProverbs.value.length} proverbs remaining in this session.`)
  checkAndSendScheduledNotification(currentVerse.value.text, currentVerse.value.reference)
}

// --- UI Helper Functions ---
async function enableNotifications() {
  try {
    await requestNotificationPermission()
    notificationsEnabled.value = true
    isScheduling.value = true
  } catch (err) {
    alert('Failed to enable notifications. Please check your browser settings.')
  }
}

function saveNotificationTime() {
  if (!notificationTime.value) {
    alert('Please select a time.')
    return
  }
  localStorage.setItem('proverb_notification_time', notificationTime.value)
  alert(`Notification time saved for ${notificationTime.value}!`)
  isScheduling.value = false
}

function editNotificationTime() {
  isScheduling.value = true
}

// --- LIFECYCLE HOOK ---
onMounted(() => {
  fetchProverbsData()
  const savedTime = localStorage.getItem('proverb_notification_time')
  if (savedTime) {
    notificationTime.value = savedTime
  }
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
