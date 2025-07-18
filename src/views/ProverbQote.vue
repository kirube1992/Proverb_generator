
<script setup>
import { ref, onMounted } from 'vue';

const proverb = ref({ text: '', reference: '' });
const isLoading = ref(false);

const error = ref(null);

async function getProverbOfTheDay() {
  isLoading.value = true;
  error.value = null;

  try {

    const today = new Date();
    const dayofmonth = today.getDate();

    const apiUrl = `https://bible-api.com/proverbs+${dayofmonth}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('The data was not found');
    }

    // FIX 2: Use lowercase .json()
    const data = await response.json();

    proverb.value = {
      text: data.verses[0].text.trim(),
      reference: data.reference
    };
  } catch (err) {
    // Corrected spelling for clarity
    console.error("Failed to fetch the proverb", err);
    error.value = 'Sorry, we couldn\'t fetch the proverb. Please try again.';
  } finally {
    // FIX 3 (again): You MUST use .value to change a ref
    isLoading.value = false;
  }
}

onMounted(() => {
  getProverbOfTheDay();
});
</script>
<template>
  <div class="proverb-quote">
    <h2>Proverb of the day</h2>
    
    <!-- Show a loading message while fetching -->
    <div v-if="isLoading">
      <p>Loading...</p>
    </div>

    <!-- Show an error message if something went wrong -->
    <div v-else-if="error">
      <p class="error">{{ error }}</p>
    </div>

    <!-- Show the proverb once it's loaded -->
    <div v-else>
      <p>"{{ proverb.text }}"</p>
      <cite>{{ proverb.reference }}</cite>
    </div>
    
    <!-- Disable the button while loading to prevent multiple clicks -->
    <button @click="getProverbOfTheDay" :disabled="isLoading">
      {{ isLoading ? 'Loading...' : 'Get new Verse' }}
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
    }s
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
    botton:hover {
      transform: scale(1.2); /* Increases size by 10% */
      transition: transform 0.3s ease; /* Smooth animation */
    }
</style>