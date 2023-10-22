<template>
  <article class="p-2 md:p-5 w-full flex flex-col">
    <!-- upper section -->
    <div class="flex-1 flex flex-wrap md:gap-5">
      <!-- preview -->
      <figure class="w-full sm:w-1/2 md:w-1/3 p-5 md:pb-8 flex">
        <div class="flex w-full justify-start items-start">
          <!-- (last mint) -->
          <router-link v-if="lastMintId" class="aspect-square bg-pencil-6h w-full relative mouse:hover:ring-8 mouse:hover:ring-zinc-200" :to="{name: 'token', params: { tokenId: lastMintId }}">
            <div class="absolute z-10 -top-3.5 -left-3.5 bg-pen text-white rounded-xl px-3 py-1 uppercase">LAST MINT: {{ lastMintName ?? `#${lastMintId}` }}</div>
            <!-- <NFTThumbImage :id="lastMintId" :key="lastMintId" /> -->
            <iframe :key="lastMintId" :src="iframeBaseURI + '/get/iframe?#' + lastMintId" class="relative w-full aspect-square bg-pencil-6h pointer-events-none" frameborder="0"></iframe>
          </router-link>
          <!-- (loading / "?") -->
          <div v-else class="aspect-square bg-pencil-6h w-full relative flex items-center justify-center">
            <div class="absolute z-10 -top-3.5 -left-3.5 bg-pen text-white rounded-xl px-3 py-1 animate-pulse">LAST MINT...</div>
            <svg class="w-1/3 animate-pulse" viewBox="0 0 175 284" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
              <path d="M138.647 157.286C137.827 157.872 128.161 164.667 109.65 177.672C97.8163 185.874 88.7949 193.43 82.5854 200.343C76.9617 206.552 70.7521 209.657 63.9568 209.657C57.2786 209.657 51.4205 207.255 46.3826 202.452C41.3447 197.531 38.8257 191.907 38.8257 185.581C38.8257 176.208 46.3826 165.722 61.4964 154.123C75.4386 144.281 89.3807 134.381 103.323 124.423C118.437 112.941 125.994 102.572 125.994 93.3162C125.994 82.4202 120.428 72.2272 109.298 62.7372C98.285 53.1299 86.8032 48.3263 74.8528 48.3263C68.5261 48.3263 59.8561 51.9583 48.843 59.2223C37.8298 66.3691 30.0386 69.9426 25.4693 69.9426C18.5568 69.9426 12.6988 67.4236 7.89515 62.3857C3.2087 57.2306 0.865479 51.5483 0.865479 45.3387C0.865479 33.6226 11.1171 22.9024 31.6203 13.178C48.9601 4.85954 63.371 0.700317 74.8528 0.700317C100.277 0.700317 123.24 10.0732 143.744 28.819C164.364 47.5648 174.674 69.0639 174.674 93.3162C174.674 117.334 162.665 138.658 138.647 157.286ZM54.291 283.645C47.6128 283.645 41.5204 281.536 36.0138 277.318C30.0386 272.631 27.051 266.832 27.051 259.919C27.051 251.952 29.3942 244.571 34.0807 237.776C39.7044 229.457 47.2613 225.298 56.7514 225.298C64.7183 225.298 70.9279 228.286 75.38 234.261C78.8948 239.182 80.6522 244.981 80.6522 251.66C80.6522 258.806 78.7191 265.485 74.8528 271.694C69.932 279.661 63.0781 283.645 54.291 283.645Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </figure>

      <!-- mint info -->
      <section class="flex-1 min-w-0 flex flex-col p-stroke md:p-5 gap-5 pb-8 text-h4 sm:text-h5b md:text-h4 uppercase">
        <div class="leading-snug">
          <div class="flex justify-between">
            <div>MINTED:</div>
            <div :class="{'text-green-500': isMintedOut}">{{ $store.getters.mintCount }}/486</div>
          </div>
          <div class="flex justify-between items-center gap-1.5">
            <div class="mr-5">PRICE:</div>
            <div v-if="!$store.state.price" class="animate-pulse">...</div>
            <template v-else>
              <div class="flex-1 min-w-0 truncate text-right">
                {{ formatEther($store.state.price.toString()) }}
              </div>
              <div class="ml-0.5">
                <svg class="h-8" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
                <path d="M4.32812 6.58854C8.35613 6.58854 11.6577 3.81207 15.6107 3.81207C17.9164 3.81207 20.1837 4.31688 22.4423 4.31688C23.2411 4.31688 24.3485 4.06143 25.1221 4.33091C25.6933 4.52988 26.0931 5.08545 26.6863 5.32651" stroke="black" stroke-width="5" stroke-linecap="round"/>
                <path d="M4.32812 15.6751C6.95037 15.6751 9.57262 15.6751 12.1949 15.6751C14.1849 15.6751 15.9827 14.7541 17.9454 14.6655C19.3002 14.6043 20.6745 14.6655 22.0283 14.6655C23.2731 14.6655 24.5315 15.1703 25.6512 15.1703" stroke="black" stroke-width="5" stroke-linecap="round"/>
                <path d="M3.5 28.2954C7.24936 28.2954 10.9987 28.2954 14.7481 28.2954C16.4862 28.2954 17.5801 27.8864 19.13 27.1596C21.4281 26.0819 23.2017 25.7714 25.6511 25.7714" stroke="black" stroke-width="5" stroke-linecap="round"/>
                </svg>
              </div>
            </template>
          </div>
        </div>
        
        <!-- (mint status) -->
        <div v-if="status" class="flex-1 rounded-stroke2x flex items-center justify-center text-h5b normal-case p-5 min-h-16 text-center leading-snug" :class="{'bg-red-100 text-red-500': status.type === 'error', 'bg-green-100 text-green-500': status.type === 'success', 'bg-blue-100 text-blue-500': !status.type, 'animate-pulse': status.message.includes('...')}">
          <div>
            <template v-if="status.type === 'success'">
              <span class="text-h4">SUCCESS!</span>
              <div class="mt-5">
                <router-link to="/nfts/yours" class="flex items-end leading-none gap-2">
                  <span class="underline">view your collection</span><SvgArrowDown class="w-5 transform -rotate-90 origin-center" stroke-width="7" />
                </router-link> 
              </div>
            </template>
            <template v-else>
                {{ status.message }}
            </template>
          </div>
        </div>

        <!-- (tx msgs...) -->
        <div v-else class="flex-1 h-64 relative overflow-hidden">
          <div class="absolute overlay overflow-y-scroll">
            <TxList :txs="txs" />
            <div class="h-20"></div>
          </div>
          <div class="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-b from-transparent to-white pointer-events-none"></div>
        </div>
      </section>
    </div>

    <!-- buttons row -->
    <footer class="flex flex-col gap-2 mlg:flex-row mlg:h-[33%] mlg:gap-5" style="min-height:160px">
      <!-- (sold out: open sea link) -->
      <template v-if="isMintedOut">
        <a href="https://opensea.io/collection/nft" target="_blank" class="h-32 mlg:flex-1 flex items-center justify-center border border-stroke border-nft rounded-stroke2x bg-blue-400 text-white border-blue-500 mouse:hover:border-blue-600">
          <div class="flex items-center text-h3 md:text-h1" style="gap:0.5em">
            <!-- <SvgStars style="height:1.5em" stroke-width="7"/> -->
            Buy on OpenSea
            <SvgArrowDown class="transform -rotate-90 origin-center" style="height:1.2em" stroke-width="5" />
          </div>
        </a>
      </template>

      <!-- (connect | mint | qty) -->
      <template v-else>
        <!-- ("connected" box) -->
        <div v-if="canMint" class="min-h-32 mlg:h-auto mlg:flex-1 flex flex-col rounded-stroke2x border-stroke border-blue-100 bg-blue-100 text-blue-500 relative">
          <div class="flex w-full justify-between text-h5">
            <div class="text-h5 leading-none p-stroke">connected</div>
            <!-- disconnect btn -->
            <button class="px-stroke rounded-xl mouse:hover:bg-blue-200" @click="$store.dispatch('disconnect')">
              <SvgX style="height:1.3em" stroke-width="5" />
            </button>
          </div>
          <!-- connected acct -->
          <div class="flex-1 flex items-center w-full justify-center text-h3 md:text-h1">
            {{ $store.getters.addrShort($store.getters.address) }}
          </div>          
        </div>
        
        <!-- (connect btn) -->
        <button v-else class="h-32 mlg:h-auto mlg:flex-1 flex items-center justify-center border border-stroke border-nft rounded-stroke2x" @click="$store.dispatch('connect')" >
          <div class="flex items-center text-h3 md:text-h1" style="gap:0.5em">
            <SvgWallet style="height:1.4em" stroke-width="7"/>
            CONNEKT
          </div>
        </button>

        <!-- mint btn -->
        <button class="h-32 mlg:h-auto mlg:flex-1 flex items-center justify-center border border-stroke border-nft rounded-stroke2x" @click="mint" :class="{'opacity-20': !canMint, 'bg-green-400 text-white border-green-500 mouse:hover:border-green-600': canMint}" :disabled="!canMint">
          <div class="flex items-center text-h3 md:text-h1" style="gap:0.5em">
              <SvgStars style="height:1.5em" stroke-width="7"/>
              MINT
            </div>
        </button>

        <!-- mint qty options -->
        <div class="min-h-12 mlg:h-auto flex mlg:flex-col gap-stroke text-h5" :class="{'opacity-20 pointer-events-none': !canMint}">
          <template v-for="n in [1,3,5]">
            <button :class="['flex-1 w-32 flex items-center justify-center rounded-full', mintQty === n ? 'bg-pen text-white' : 'bg-pencil-6h mouse:hover:bg-pencil-5h']" @click="mintQty = n" :disabled="!canMint">
              {{ n }}x
            </button>
          </template>
        </div>
      </template>
    </footer>
  </article>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import store from '@/store'
  import SvgWallet from '@/components/SvgWallet.vue'
  import SvgStars from '@/components/SvgStars.vue'
  import SvgX from '../components/SvgX.vue';
  // import NFTThumbImage from '../components/NFTThumbImage.vue';
  import { formatEther } from 'ethers/lib/utils';
  import SvgArrowDown from '../components/SvgArrowDown.vue';
  import TxList from '../components/TxList.vue';

  const txs = computed(() => store.state.pending.filter(tx => tx.name === 'mint'))
  
  const lastMintId = computed(() => store.state.nfts.length ? store.state.nfts.length : undefined)
  const lastMintName = computed(() => store.state.nfts[lastMintId.value - 1]?.name)
  
  const nfts = computed(() => {
    return store.state.nfts
  })

  const isMintedOut = computed(() => {
    return nfts.value.length >= store.state.MAX_SUPPLY
  })

  const mintQty = ref(1)
  const canMint = computed(() => {
    return store.getters.address
  })
  const status = ref()
  
  store.dispatch('getPrice')
  
  async function mint() {
    try {
      status.value = { message: 'confirm tx in your wallet...' }
      await store.dispatch('mint', mintQty.value)
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

  watch(store.getters.address, () => {
    status.value = undefined
  })

  const iframeBaseURI = import.meta.env.VITE_SERVER
</script>