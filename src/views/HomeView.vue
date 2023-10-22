<script setup>
  import { RouterLink, RouterView, useRoute } from 'vue-router'
  import Glyphs from '../components/GlyphsRand.vue'
  import { computed, onMounted, ref, watch } from 'vue';
  import store from '../store';
  import Addr from '../components/Addr.vue'
  import { formatEther } from 'ethers/lib/utils';
  import TxList from '../components/TxList.vue';
  import SvgFoliaLogo from '../components/SvgFoliaLogo.vue';

  // rand lat/long
  function getRandomInRange (from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    // .toFixed() returns string, so ' * 1' is a trick to convert to number
  }
  function randGPS () {
    return getRandomInRange(-180, 180, 8)
  }

  const isConnected = computed(() => store.getters.address)
  const count = computed(() => store.getters.mintCount)
  const maxSupply = computed(() => store.state.maxSupply)
  const nfts = computed(() => store.state.nfts)
  // demo
  // const connectedAccount = 'demo.eth'
  const tokensMeta = Array(139).fill(0).map(() => ({ latlong: `${randGPS()}, ${randGPS()}` }))
  const getToken = id => store.state.nfts?.find(token => token.tokenId === id.toString())

  // highlight mints
  const recentMints = ref([])
  let flash
  watch(count, (to, from) => {
    if (from === undefined) return
    const lastBatch = to - (from ?? 0)
    recentMints.value = nfts.value.slice(-lastBatch).map(token => token.tokenId)
    clearTimeout(flash)
    flash = setTimeout(() => { recentMints.value = [] }, 1500)
  })

  // intro sequence
  const loadingCount = ref(sessionStorage.getItem('loaded') ? 999 : 0)
  
  const intro = () => {
    const count = () => {
      loadingCount.value++
      if (loadingCount.value > 23) {
        // skip next load
        sessionStorage.setItem('loaded', true)
        return
      }
      setTimeout(count, 300)
    }
    setTimeout(count, 400)
  }

  // tooltip
  const tooltip = ref()
  const toolTipToken = ref()
  const toolTipPosition = ref({})
  
  const showTooltip = (n) => {
    toolTipToken.value = n
  }

  const onLinkMouseEnter = (n) => {
    if (!window.matchMedia('(hover:hover)').matches) return
    showTooltip(n)
  }
  
  const moveTooltip = (e) => {
    let translate = [0,0]
    if (e.clientX + tooltip.value.offsetWidth > window.innerWidth) {
      translate[0] = '-100%'
    }
    if (e.clientY + tooltip.value.offsetHeight > window.innerHeight) {
      translate[1] = '-100%'
    }
    toolTipPosition.value = { top: e.clientY + 'px', left: e.clientX + 'px', transform: `translate(${translate.join(',')})` }
  }

  const hideTooltip = () => {
    toolTipToken.value = undefined
  }

  // 
  const route = useRoute()
  const transition = ref('none')
  
  watch(() => route.name, (to, from) => {
    console.log(to, from)
    if (to === 'token') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    transition.value = to !== from ? 'overlayfade' : 'none'
  })

  // last viewed token overlay
  let lastViewed = ref()
  watch(() => route.params.tokenId, (id, prevId) => {
    lastViewed.value = prevId
  })

  store.dispatch('getPrice')
  store.dispatch('getMaxSupply')

  const status = ref()

  async function mint() {
    try {
      status.value = { message: 'confirm tx in your wallet...' }
      await store.dispatch('mint', 1)
      status.value = null
    } catch (error) {
      let popup
      // look for part of error that begins reason=" and ends with another double quotation mark
      const match = error.toString().match(/reason="([^"]*)"/)
      if (match) {
        popup = match[1]
      }else {
        popup = error.toString().replace("Error: ", "")
      }
      const result = { type: 'error', message: popup }
      status.value = result
      setTimeout(() => {
        if (status.value.message === result.message)
          status.value = null
      }, 5000)
      // store.dispatch('popup', popup)
    }
  }

  const txs = computed(() => store.state.pending.filter(tx => tx.name === 'mint'))

  onMounted(() => {
    intro()
  })
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition :name="transition">
      <component :is="Component" :key="$route.path" />
    </transition>
  </router-view>

  <article class="max-w-full break-all">
    <template v-if="loadingCount > 0">
      <Glyphs minmax="2,3" subset="1" />
      <SvgFoliaLogo class="h-[0.75em] inline align-baseline" />
      <Glyphs subset="1" />
    </template>

    <template v-if="loadingCount > 1">
      <a href="https://folia.app" class="btn-underline">folîä</a>
    </template>
    <template v-if="loadingCount > 2">
      <Glyphs subset="1" minmax="5,15" />
      prësents
    </template>
    <template v-if="loadingCount > 6">
      <Glyphs minmax="30,50" subset="3" />
    </template>
    <h1 class="inline">
      <template v-if="loadingCount > 10">
        Travess
      </template>
      <template v-if="loadingCount > 11">
        <Glyphs minmax="3,5" subset="1" />Smalley
      </template>
      <template v-if="loadingCount > 14">
        <Glyphs subset="1"/>
      </template>
      <template v-if="loadingCount > 16">Coordinates</template>
      <template v-if="loadingCount > 20">
        <Glyphs />
      </template>
    </h1>

    <template v-if="loadingCount > 23">
      <Glyphs minmax="120,160" />
      <div class="hidden sm:inline"><Glyphs minmax="400,600" /></div>
      <Glyphs subset="1" />
      <!-- minted -->
      <span :class="['inline-block', {'bg-white text-black': recentMints.length}]">minted:&nbsp;<template v-if="count !== undefined">{{Math.min(count, maxSupply ?? 999)}}</template><span v-else class="animate-blink">...</span>/<template v-if="maxSupply">{{maxSupply}}</template><span v-else class="animate-blink">...</span>&nbsp;</span>
      <Glyphs subset="1" />
      <Glyphs minmax="120,160" />
      <div class="hidden sm:inline"><Glyphs minmax="400,600" /></div>
      <Glyphs subset="1" />
      <!-- (connected $account) -->
      <template v-if="!isConnected">
        (((<button class="inline-block bg-white text-black btn-flash-slow px-[0.2em]" @click="$store.dispatch('connect')">
          CONNECT-WALLET
        </button>)))
      </template>
      <template v-if="isConnected">
        <span class="inline-block pr-[0.2em]">connected: </span><div class="inline-block bg-white text-black mr-[0.1em]"><Addr :address="$store.getters.address" /></div>
      </template>
      <!-- connect/disconnect btn -->
      <template v-if="isConnected">
        (((<button class="inline-block btn-highlight" @click="$store.dispatch('disconnect')">
          DISCONNECT
        </button>))) 
      </template>
      <Glyphs subset="1" />
      <Glyphs minmax="120,160" />
      <div class="hidden sm:inline"><Glyphs minmax="400,600" /></div>
      <Glyphs subset="1" />
      <!-- mint btn -->
      (((<button :class="['inline-block bg-white text-black px-[0.2em]' , {'animate-flash-slow': isConnected && !status && !txs.length, 'btn-flash-slow': !status}]" @click="mint">
        MINT
      </button>)))
      <Glyphs subset="1" minmax="3,5" />
      <!-- (mint status) -->
      <p v-if="status" class="inline" :class="{'text-red-600': status.type === 'error', 'text-lime-500': status.type === 'success', 'bg-white text-black': !status.type, 'animate-flash-slow': status.message.includes('...')}">
        <template v-if="status.type === 'success'">
          <span class="text-h4">your mint is highlighted below</span>
        </template>
        <template v-else>
          {{ status.message }}
        </template>
      </p>
      <Glyphs subset="1" minmax="3,5" />
      <!-- (tx msgs...) -->
      <TxList :txs="txs" />
      <!-- price -->
      <div class="inline-block">price: <span v-if="!$store.state.price" class="animate-blink">...</span><template v-else>{{ formatEther($store.state.price.toString()) }}</template> ETH </div>
      <Glyphs minmax="160,200" />
      <div class="hidden sm:inline"><Glyphs minmax="600,800" /></div>
      <!-- token list -->
      <template v-if="maxSupply === undefined">
        <span class="animate-blink">loading...</span>
      </template>
      <template v-else>
        <ul class="inline">
          <!-- tokens... -->
          <template v-for="n in maxSupply" :key="'thumb'+n">
            <Glyphs minmax="60,100"/>
            <!-- TODO add new mint highlight logic -->
            <li :class="['inline', {'bg-white text-black': recentMints.includes(n.toString()) }]">
              
              <template v-if="n <= count">
                <!-- minted thumb -->
                <router-link :to="`/tokens/${getToken(n).tokenId}`" :data-no="toolTipToken" class="group btn-highlight" :class="{'ring-1 ring-white': lastViewed === getToken(n).tokenId}" @mouseenter="onLinkMouseEnter(n)" @mousemove="moveTooltip" @mouseleave="hideTooltip">
                  ({{ tokensMeta[n-1].latlong }})
                  <img class="inline-block h-[1.1em] transform -translate-y-[0.1em] align-middle mouse:group-hover:outline" :src="`https://travess2.netlify.app/demo/art/thumbs/thumb${n}.png`" />
                  #{{ ('000' + n).slice(-3) }}
                </router-link> 
                <!-- / -->
                <!-- token link -->
                <!-- <a :href="$store.getters.openSeaLink({ account: getToken(n).owner })" :class="['group btn-underline']" target="_blank" rel="noopener noreferrer" @mouseenter="onLinkMouseEnter('view-token:' + n)" @mousemove="moveTooltip" @mouseleave="hideTooltip">opensea</a> -->
                /
                <!-- owner link -->
                <a :href="$store.getters.openSeaLink({ tokenId: getToken(n).tokenId })" :class="['btn-underline', {'bg-white text-black': getToken(n).owner.toLowerCase() === $store.getters.address?.toLowerCase()}]" target="_blank" rel="noopener noreferrer" @mouseenter="onLinkMouseEnter('view-owner')" @mousemove="moveTooltip" @mouseleave="hideTooltip">
                  <Addr :address="getToken(n).owner" />
                </a>
              </template>
              <template v-else>
                <!-- unminted -->
                <div class="inline-flex items-center justify-center aspect-card border h-[1.1em] align-middle"></div>
              </template>
            </li>
          </template>
        </ul>
      </template>
      <Glyphs minmax="120,160" />
      <a :href="$store.getters.etherscanLink()" class="btn-underline" target="_blank">contract</a>
      <Glyphs minmax="10,20" />
      <a :href="$store.getters.openSeaLink({})" class="btn-underline" target="_blank">opensea</a>
      <Glyphs minmax="20,30" />
      <a href="https://folia.app" class="btn-highlight">exit</a>
    </template>
    
    <!-- link tooltip -->
    <div ref="tooltip" :class="['fixed z-10 pointer-events-none py-[1em] w-auto h-auto transition-opacity duration-300', {'opacity-0': !toolTipToken}]" :style="toolTipToken ? toolTipPosition : ''">
      <template v-for="n in count" :key="'thumb2'+n">
        <img :src="`https://travess2.netlify.app/demo/art/thumbs/thumb${n}.png`" :class="['block max-w-[256px] max-h-[256px]', {'hidden': toolTipToken !== n}]" />
      </template>
      <div class="bg-white text-black px-[0.2em] whitespace-nowrap" :class="{'hidden': toolTipToken !== 'view-owner'}">view on OpenSea</div>
      <!-- <div class="bg-white text-black px-[0.2em] whitespace-nowrap" :class="{'hidden': !((toolTipToken ?? '').toString().includes('view-token')) }">view #{{ ((toolTipToken ?? '').toString().split(':')[1] ?? '?') }} on OpenSea</div> -->
    </div> 
  </article>
</template>

<style>
.overlayfade-enter-active{
  transition:opacity 1000ms
}
.overlayfade-leave-active{
  transition: opacity 150ms;
}
.overlayfade-enter-from,
.overlayfade-leave-to{
  opacity:0
}
</style>

