<script setup>
import { useRoute } from 'vue-router';
import { onMounted, onUnmounted } from 'vue'
import { ref, computed } from 'vue';
import { ipfsIframe } from '../plugins/ipfs';
import store from '../store';

const route = useRoute()
const tokenId = route.params.tokenId
const isNotMinted = computed(() => !store.state.nfts ? undefined : store.state.nfts.find(token => token.tokenId === tokenId) === undefined)

const iframePath = import.meta.env.VITE_DEV_IFRAME_PATH ?? ipfsIframe
const { VITE_IPFS_HASH_IMAGES } = import.meta.env

const loading = ref(true)

function onIframeLoad (e) {
  loading.value = false
}

// function onWindowMessage (e) {
//   console.log(e.data, e)
// }

const closeOverlayButton = ref()

onMounted(() => {
  // window.addEventListener('message', onWindowMessage)
  closeOverlayButton.value.focus()
})

onUnmounted(() => {
  // window.removeEventListener('message', onWindowMessage)
})
</script>

<template>
  <article class="fixed z-30 overlay bg-[rgba(0,0,0,0.85)] overflow-hidden p-12 flex cursor-pointer">
    <button ref="closeOverlayButton" class="absolute overlay outline-none" @click="$router.go(-1)" aria-label="Close token view"></button>
    <!-- inset media from window edge -->
    <div class="relative w-full z-10" @click.stop>
      <!-- (loading) -->
      <div class="absolute overlay flex items-center justify-center bg-black" style="font-family:monospace; font-size:14px">
        <template v-if="isNotMinted === true">
          #{{ ('000' + tokenId).slice(-3) }} is not yet minted!
        </template>
        <template v-else-if="isNotMinted === undefined || loading">
          <span class="animate-blink">...</span>
        </template>
      </div>

      <template v-if="isNotMinted === false">
        <iframe class="absolute overlay" :src="`${iframePath}#${tokenId}-${VITE_IPFS_HASH_IMAGES}`" @load="onIframeLoad" />
      </template>
    </div>
  </article>
</template>

<style scoped>
</style>