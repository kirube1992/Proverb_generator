
<script setup>
import { ref, onMounted } from 'vue';
import { requestNotificationPermission, checkAndSendDailyNotification } from '../notification.js';

const currentVerse  = ref({ text: '', reference: '' });
const isLoading = ref(false);
const allChapters  = ref([]); 
const error = ref(null);

async function fetchChapterOfTheDay() {
  isLoading.value = true;
  error.value = null;

  try {
    const apiUrl = `https://proverb-api-data.vercel.app/`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('The data was not found');
    }

     allChapters.value = await response.json();

    //currentVerse.value = data;

    await checkAndSendDailyNotification(currentVerse.value.text, currentVerse.value.reference);

     displayVerseOfTheDay();


  } catch (err) {
    // Corrected spelling for clarity
    console.error("Failed to fetch the proverb", err);
    error.value = 'Sorry, we couldn\'t fetch the proverb. Please try again.';
  } finally {
    // FIX 3 (again): You MUST use .value to change a ref
    isLoading.value = false;
  }

}

function displayVerseOfTheDay() {

  if(allChapters.value.length === 0) {
    error.value = "No verse availabel, please refresh";
    return;
  }

    const today = new Date();
    const dayOfMonth = today.getDate();

  const todaysChapter = allChapters.value.find(chap => Number(chap.chapter) === dayOfMonth);
     if (!todaysChapter) {
    error.value = `No proverbs found for day ${dayOfMonth}.`;
    return;
  }

  const verseCount = todaysChapter.verses.length

  const randomIndex = Math.floor(Math.random() * verseCount)

  const randomVerseText = todaysChapter.verses[randomIndex];

    currentVerse.value = {
    text: randomVerseText,
    // We construct the reference ourselves now
    reference: `ምሳሌ ${todaysChapter.chapter}:${randomIndex + 1}`

  };
   checkAndSendDailyNotification(currentVerse.value.text, currentVerse.value.reference);
}

async function enableNotifications() {
  try {
    await requestNotificationPermission();
    alert('Notifications have been enabled!');
  } catch (error) {
    alert('Failed to enable notifications. Please check your browser settings.');
  }
}

onMounted(() => {
  fetchChapterOfTheDay();
});
</script>
<template>
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
</template>
<style scoped>
.proverb-quote {
  background-image: linear-gradient(#b47f24, #b134db);
  max-width: 800px; 
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  border: 1px solid #2c7ca0;
  border-radius: 8px;
  padding: 35px;
  margin-top:150px;
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
        border:none;
        border-radius: 8px;
        font-weight: 400;
        background-image: linear-gradient(#cd09a2, #a9431e);
    }
    button:hover {
      transform: scale(1.2); /* Increases size by 10% */
      transition: transform 0.3s ease; /* Smooth animation */
    }

    .btn1 {
       margin-left: 5px;
    }
</style>