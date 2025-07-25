
<script setup>
import { ref, onMounted } from 'vue';
import { requestNotificationPermission, checkAndSendDailyNotification } from '../notification.js';

const currentVerse  = ref({ text: '', reference: '' });
const isLoading = ref(false);
const allChapters  = ref([]); 
const error = ref(null);

// async function fetchChapterOfTheDay() {
//   isLoading.value = true;
//   error.value = null;

//   try {
//     const apiUrl = `https://proverb-api-data.vercel.app/chapters`;
//     const response = await fetch(apiUrl);
//     if (!response.ok) {
//       throw new Error('The data was not found');
//     }

//      allChapters.value = await response.json();

//     //currentVerse.value = data;

//     await checkAndSendDailyNotification(currentVerse.value.text, currentVerse.value.reference);

//      displayVerseOfTheDay();


//   } catch (err) {
//     // Corrected spelling for clarity
//     console.error("Failed to fetch the proverb", err);
//     error.value = 'Sorry, we couldn\'t fetch the proverb. Please try again.';
//   } finally {
//     // FIX 3 (again): You MUST use .value to change a ref
//     isLoading.value = false;
//   }

// }

// async function fetchProverbsData() {
//   isLoading.value = true;
//   error.value = null;

//   try {
//     // We fetch from the base URL now, as it returns the whole object
//     const apiUrl = `https://proverb-api-data.vercel.app/`; 
    
//     const response = await fetch(apiUrl);
//     if (!response.ok) {
//       throw new Error("Could not connect to the API.");
//     }
    
//     // Get the whole object: { chapters: [...] }
//     const data = await response.json(); 

//     // IMPORTANT: Access the .chapters property from the returned data
//     allChapters.value = data.chapters; 

//     // Safety check if the chapters array is missing or empty
//     if (!allChapters.value || allChapters.value.length === 0) {
//       throw new Error("The 'chapters' array was not found in the API response.");
//     }
    
//     displayVerseOfTheDay();

//   } catch (err) {
//     console.error("Error fetching data:", err);
//     error.value = "Sorry, we couldn't load the proverbs. Please try again.";
//   } finally {
//     isLoading.value = false;
//   }
// }

// Replace your existing fetchProverbsData function with this one.

async function fetchProverbsData() {
  isLoading.value = true;
  error.value = null;
  console.log("--- Starting Fetch Process ---");

  try {
    const apiUrl = `https://proverb-api-data.vercel.app/chapters`;
    console.log("1. Fetching from URL:", apiUrl);

    const response = await fetch(apiUrl);
    console.log("2. Received response. Status:", response.status, response.statusText);

    // This is a check for network errors (like 404 or 500)
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    // This is a crucial debugging step. We'll check the raw text of the response
    // before we try to parse it as JSON.
    const rawText = await response.text();
    console.log("3. Raw text from API:", rawText);

    // Now, we try to parse the raw text as JSON.
    // If the rawText is not valid JSON, this line will fail and jump to the catch block.
    const data = JSON.parse(rawText);
    console.log("4. Successfully parsed JSON. Data:", data);

    // Check if the data is an array as we expect.
    if (!Array.isArray(data)) {
        throw new Error("The API did not return an array of chapters.");
    }

    // Assign the data to our state.
    allChapters.value = data;
    console.log("5. Successfully assigned data to allChapters. It now has", allChapters.value.length, "items.");

    // After everything is successful, display the verse.
    displayVerseOfTheDay();

  } catch (err) {
    // This will catch any error from the steps above.
    console.error("!!! An error occurred in the fetch process:", err);
    error.value = "Sorry, a critical error occurred while loading proverbs.";
  } finally {
    isLoading.value = false;
    console.log("--- Finished Fetch Process ---");
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