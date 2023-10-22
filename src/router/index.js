import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: '/tokens/:tokenId',
          name: 'token',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/TokenView.vue')
        }
      ]
    },
  ],
  scrollBehavior (to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else if (savedPosition) {
      // if (to.name === 'mints' && savedPosition) {
      //   // wait for page transition
      //   return new Promise((resolve, reject) => {
      //     setTimeout(() => resolve(savedPosition), 800)
      //   })
      // }
      return savedPosition
    } else {
      // don't scroll to top on user tab changes...
      if (to.name.includes(from.name)) {
        return
      }
      // scroll to top
      // return { top: 0 }
    }
  }
})

export default router
