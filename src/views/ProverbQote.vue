<script setup>
import { ref, onMounted } from 'vue';

// --- STATE ---
const currentVerse = ref({ text: '', reference: '' });
const allChapters = ref([]);
const isLoading = ref(false);
const error = ref(null);

// --- FUNCTIONS ---

async function fetchProverbsData() {
  isLoading.value = true;
  error.value = null;

  try {
    const apiUrl = `https://raw.githubusercontent.com/kirube1992/proverb-api-data/refs/heads/main/db.json`; 
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Could not fetch the proverbs database from GitHub.");
    }

    const data = await response.json();
    
    // This is a key check. Does the downloaded data have a 'chapters' array?
    if (!data.chapters || !Array.isArray(data.chapters)) {
      throw new Error("Database format is incorrect. The 'chapters' array was not found.");
    }
    
    // If the check passes, store the chapters.
    allChapters.value = data.chapters;

    // After successfully loading and storing the data, display a verse.
    displayVerseOfTheDay();

  } catch (err) {
    console.error("Error during fetch or data processing:", err);
    error.value = "Sorry, a critical error occurred while loading the proverbs.";
  } finally {
    isLoading.value = false;
  }
}

function displayVerseOfTheDay() {
  if (allChapters.value.length === 0) {
    // This function can't run if there's no data.
    return;
  }

  const today = new Date();
  const dayOfMonth = today.getDate();

  // Find today's chapter from the data we stored.
  const todaysChapter = allChapters.value.find(chap => Number(chap.chapter) === dayOfMonth);

  if (!todaysChapter) {
    error.value = `No proverbs found in the database for day ${dayOfMonth}.`;
    return;
  }

  // Pick a random verse from today's chapter.
  const verseCount = todaysChapter.verses.length;
  const randomIndex = Math.floor(Math.random() * verseCount);
  const randomVerseText = todaysChapter.verses[randomIndex];

  // Update the UI.
  currentVerse.value = {
    text: randomVerseText,
    reference: `ምሳሌ ${todaysChapter.chapter}:${randomIndex + 1}`
  };
}

// --- LIFECYCLE HOOK ---
onMounted(() => {
  fetchProverbsData();
});
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
    <button class="btn1"  @click="displayVerseOfTheDay" :disabled="isLoading">
      {{ isLoading ? 'Loading...' : 'Get new Verse' }}
    </button >
    <br></br>
      <button @click="enableNotifications" class="notification-btn">
    Enable Daily Notifications
  </button>
  </div>
</div>
</template>
<style scoped>
.page-container {
  display: flex;
  justify-content: center;  /* horizontal center */
  align-items: center;      /* vertical center */
  min-height: 100vh;        /* full screen height */
  padding: 20px;            /* fallback padding */
  box-sizing: border-box;
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
