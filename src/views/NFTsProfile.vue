<template>
  <header class="flex flex-col mlg:flex-row mlg:flex-wrap mlg:justify-between gap-inherit">
    <!-- LEFT NAV -->
    <!-- (route profile: "view all" link) -->
    <router-link v-if="isGenericProfile" :class="['hidden mlg:flex h-16 md:h-20 justify-center items-center text-h5b pl-6 pr-10 gap-6 bg-pen text-white rounded-stroke mouse:hover:border-zinc-400']" :to="{name: 'nfts-index'}">
      <SvgArrowDown class="h-6 transform origin-center rotate-90" stroke-width="7" />
      ALL
    </router-link>
    <!-- (route my-profile: page nav) -->
    <NFTsNav v-else class="order-first w-full mlg:w-auto" />
    
    <!-- account bar -->
    <div class="w-full mlg:order-3">
      <!-- (route: my-profile) -->
      <template v-if="$route.name === 'nfts-yours'">
        <!-- (logged in profile bar) -->
        <ProfileAddressBar v-if="isLoggedIn" context="connected" :address="$store.getters.address" class="order-first mlg:order-none" @closeButtonClick="$store.dispatch('disconnect')"/>
        <!-- (login prompt) -->
        <div v-else class="h-64 bg-pencil-6h rounded-stroke flex items-center justify-center p-5 text-h5b text-center">
          <div class="flex flex-col gap-6">
            <h6 class="uppercase text-h6">Connect an Ethereum wallet</h6>
            <div class="flex justify-center">
              <button class="h-20 border border-stroke-xs rounded-xl flex items-center justify-center uppercase px-8 mouse:hover:bg-pencil-5h" @click="$store.dispatch('connect')">Connect</button>
            </div>
          </div>
        </div>      
      </template>
      <!-- (route: profile) -->
      <template v-else>
        <ProfileAddressBar :address="$route.params.address" class="order-first mlg:order-none" @closeButtonClick="$router.push({name: 'nfts-index'})"/>
      </template>
    </div>

    <!-- count / sort row -->
    <div class="mlg:order-2 w-full mlg:w-auto" :class="{'hiddenff': !nfts.length}">
      <template v-if="nfts.length">
        <NFTsFeedActions :count="nfts.length" class="pointer-events-auto" />
      </template>
    </div>
  </header>

      
  <!-- (your nfts grid) -->
  <template v-if="nfts.length">
    <NFTsGrid>
      <template v-for="nft in nfts">
        <NFTThumb :id="nft.tokenId" />
      </template>
    </NFTsGrid>
  </template>
  
  <!-- ("you have no nfts" / go mint ) -->
  <template v-else> 
    <div class="h-64 bg-pencil-6h rounded-stroke flex items-center justify-center p-5 text-h5b text-center">
      <div class="flex flex-col gap-6">
        <h6 class="uppercase text-h6">No nfts!</h6>
        <!-- (go mint btn) -->
        <div v-if="isLoggedIn && $route.name === 'nfts-yours'" class="flex justify-center mb-3">
          <router-link to="/mint" class="h-20 border border-stroke-xs rounded-xl flex items-center justify-center uppercase pl-4 pr-8 mouse:hover:bg-pencil-5h gap-4">
            <SvgArrowDown style="height:1.2em" class="transform rotate-90" stroke-width="5" />
            Go Mint
          </router-link>
        </div>
      </div>
    </div>
  </template>

  <!--  -->
  
  <footer>
    <router-link v-if="isGenericProfile" :class="['mlg:hidden flex h-16 md:h-20 justify-center items-center text-h5b pl-6 pr-10 gap-6 bg-pen text-white rounded-stroke mouse:hover:border-zinc-400']" :to="{name: 'nfts-index'}">
      <SvgArrowDown class="h-6 transform origin-center rotate-90" stroke-width="7" />
      VIEW ALL
    </router-link>
  </footer>
</template>

<script setup>
  import { computed } from 'vue'
  import store from '@/store'
  import NFTsGrid from '../components/NFTsGrid.vue';
  import NFTsFeedActions from '../components/NFTsFeedActions.vue';
  import NFTThumb from '../components/NFTThumb.vue'
  import { useRoute } from 'vue-router'
  import SvgArrowDown from '@/components/SvgArrowDown.vue'
  import ProfileAddressBar from '../components/ProfileAddressBar.vue'
  import NFTsNav from '../components/NFTsNav.vue';

  const route = useRoute()
  const address = computed(() => route.params.address ?? store.getters.address)

  const isLoggedIn = computed(() => store.getters.address)

  const isGenericProfile = route.name === 'nfts-profile'

  const nfts = computed(() => {
    if (!address.value) return []
    const nfts = store.state.nfts.filter(v => v?.owner.toLowerCase() === address.value.toLowerCase())  

    nfts.sort((a, b) => {
      if (route.query.sort === 'newest') {
        return b.tokenId - a.tokenId
      } else {
        return a.tokenId - b.tokenId
      }
    })
    return nfts
  })
</script>