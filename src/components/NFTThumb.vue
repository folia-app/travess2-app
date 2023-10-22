<template>
  <li class="nft-thumb relative group">
    <router-link class="block mouse:hover:ring-8 mouse:hover:ring-zinc-200" :to="{name: 'token', params: {tokenId: id}}">
      <figure class="relative aspect-square cursor-pointer bg-pencil-6h">
        <NFTThumbImage :id="props.id" :key="props.id"></NFTThumbImage>
        <!-- <NFTThumbIframe :id="props.id" :key="props.id" /> -->
        <div class="absolute bottom-0 left-0 rounded-xl p-1.5 leading-tight" :class="{'text-white': meta.style !== 'debug'}">
          {{meta.name}}
        </div>
      </figure>
    </router-link>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import NFTThumbImage from './NFTThumbImage.vue'
// import NFTThumbIframe from './NFTThumbIframe.vue'
import store from '@/store'

const props = defineProps(['id'])

const meta = computed(() => store.state.nfts.find(v => v.tokenId.toString() === props.id.toString()))
</script>