import { createRouter, createWebHistory } from 'vue-router'
import ProverbQote from '@/views/ProverbQote.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'porverb',
      component: ProverbQote,
    },
  ],
})

export default router
