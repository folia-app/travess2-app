<script setup>
import { useRoute } from 'vue-router';
import { onMounted, onUnmounted } from 'vue'
import { ref } from 'vue';
import { ipfsIframe } from '../plugins/ipfs';

const route = useRoute()
const tokenId = Number(route.params.tokenId)

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
      <div v-if="loading" class="absolute overlay flex items-center justify-center bg-black">
        <span class="animate-blink">...</span>
      </div>

      <iframe class="absolute overlay" :src="`${iframePath}#${tokenId}-${VITE_IPFS_HASH_IMAGES}`" @load="onIframeLoad" />
    </div>
  </article>
</template>

<style scoped>
</style>