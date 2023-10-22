import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import EmptyView from '../views/EmptyView.vue'
// import Token from '../views/Token.vue'
import Mint from '../views/Mint.vue'

const routes = [
  {
    path: '/',
    component: Home,
    children: [
      {
        path: '',
        name: 'home',
        redirect: import.meta.env.VITE_SOLD_OUT ? '/nfts' : '/mint'
      },
      {
        path: 'mint',
        name: 'mint',
        component: Mint
      },
      {
        path: 'nfts',
        name: 'nfts',
        component: () => import('../views/NFTs.vue'),
        children: [
          {
            path: '',
            name: 'nfts-index',
            component: () => import('../views/NFTsIndex.vue'), // lazy loading but not required
            // children: [
            //   {
            //     path: ':tokenId',
            //     name: 'nfts-index-token',
            //     component: () => import('../views/Token.vue')
            //   }
            // ]
          },
          {
            path: 'yours',
            name: 'nfts-yours',
            component: () => import('../views/NFTsProfile.vue')
          },
          {
            path: ':address',
            name: 'profile',
            component: () => import('../views/NFTsProfile.vue')
          }
        ]
      },
      {
        path: 'faq',
        name: 'faq',
        component: () => import('../views/FAQ.vue')
      },
    ],
  },
  {
    path: '/tokens/:tokenId',
    name: 'token',
    component: () => import('../views/Token.vue')
  },
  {
    path: '/web3connect',
    name: 'web3connect',
    component: () => import('../views/Web3ConnectView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
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
      // const isSameAddress = to.params.address && to.params.address === from.params.address
      // const isSameNetwork = to.query.network && to.query.network === from.query.network
      // if (isSameAddress || isSameNetwork) {
      //   return
      // }
      if (to.name.includes(from.name)) {
        return
      }
      // scroll to top
      return { top: 0 }
    }
  }
})

export default router
