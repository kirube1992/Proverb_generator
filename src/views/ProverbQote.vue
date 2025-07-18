
<script setup>
import { ref, onMounted } from 'vue';
import elistNguyenImage from '../assets/Images/elist-nguyen-c0z27ZZ69eY-unsplash.jpg';


const proverb = ref({ text: '', reference: '' });
const isLoading = ref(false);
// FIX 1: Correct spelling of 'ref' and 'null'
const error = ref(null);

async function getRandomProverb() {
  // FIX 3: You MUST use .value to change a ref
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch('https://api.quotable.io/random');
    if (!response.ok) {
      throw new Error('The data was not found');
    }

    // FIX 2: Use lowercase .json()
    const data = await response.json();

    proverb.value = {
      text: data.content,
      reference: data.author
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
  getRandomProverb();
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
    <button @click="getRandomProverb" :disabled="isLoading">
      {{ isLoading ? 'Loading...' : 'Get new Quote' }}
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
        padding: 10px;
        border:none;
        border-radius: 8px;
    }
</style>