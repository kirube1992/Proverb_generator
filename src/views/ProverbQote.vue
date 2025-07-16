<script setup>
import { ref } from 'vue';
import proverbs from '../proverb.json';
const proverb = ref({});
function getRandomProverb() {
 const index = Math.floor(Math.random() * proverbs.length);
proverb.value = proverbs[index];
}

getRandomProverb();

</script>
<template>
    <div class="proverb-quote">
        <h2>Proverb of the day</h2>
        <p>{{proverb.text}}</p>
        <p>{{proverb.reference}}</p>
        <button @click="getRandomProverb">get new Quote</button>
    </div>
</template>

<style scoped>
    .proverb-quote {
        color: #ccc;
        text-align: center;
        margin: 20px;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
    }

      p {
        font-size: 1.2em;
        margin: 15px 0;
    }
    cite {
        font-style: italic;
        display: block; /* Makes it appear on its own line */
        margin-top: 10px;
    }
    button {
        margin-top: 20px;
    }
</style>