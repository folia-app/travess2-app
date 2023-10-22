<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, onUnmounted } from 'vue'
import { ref } from 'vue';

const route = useRoute()
const router = useRouter()

const tokenId = Number(route.params.tokenId)

const loading = ref(true)
const img = ref()
const container = ref()
let maxW = ref(0)

const randomScroll = () => {
  const x = Math.floor(Math.random() * (img.value.offsetWidth -  container.value.offsetWidth));
  const y = Math.floor(Math.random() * (img.value.offsetHeight -  container.value.offsetHeight));
  container.value.scrollTo(x, y);
}

function onImgLoad (e) {
  clearInterval(loadingBeat)
  loading.value = false
  maxW.value = img.value.naturalWidth
  randomScroll()
}

const fitInWindow = ref(false)

function onImgClick () {
  const natW = img.value.naturalWidth
  const step = natW * 0.25
  
  if (!fitInWindow.value && maxW.value - step < window.innerWidth) {
    fitInWindow.value = true
    maxW.value = natW
    img.value.style.maxWidth = maxW.value + 'px'
  } else {
    fitInWindow.value = false
    maxW.value = maxW.value - step
    img.value.style.maxWidth = maxW.value + 'px'
  }  
}

// loading counter
const loadingCount = ref(0)
const loadingBeat = setInterval(() => { loadingCount.value++ }, 600)

// key bindings
const onKeydown = e => {
  // ESC return home
  if (e.code === 'Escape') {
    // TODO catch if they entered at tokenview
    return router.go(-1)
  }

  // left/right next/prev token
  const dir = e.code === 'ArrowRight' ? 1
    : e.code === 'ArrowLeft' ? -1
      : 0
  
  if (dir) {
    e.preventDefault()
    const nextTokenId = tokenId + dir < 1 ? 139
      : tokenId + dir > 139 ? 1
        : tokenId + dir
    router.replace({name :'token', params: {tokenId: nextTokenId }})
  }
}

const closeOverlayButton = ref()

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  closeOverlayButton.value.focus()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <article class="fixed z-30 overlay bg-[rgba(0,0,0,0.85)] overflow-hidden p-12 flex cursor-pointer">
    <button ref="closeOverlayButton" class="absolute overlay outline-none" @click="$router.go(-1)" aria-label="Close token view"></button>
    <div class="relative w-full z-10" @click.stop>
      <!-- <div :class="{'opacity-0 transition duration-0 delay-[2000ms]': !loading}">
        <GlyphsRand :key="loadingCount" minmax="8,36" subset="1" />
        loading<sup>#</sup>{{ tokenId }}
        <template v-if="loadingCount > 1">
          <GlyphsRand :key="loadingCount" minmax="8,500" subset="3" />
        </template>
        <template v-if="loadingCount > 2">
          <GlyphsRand :key="loadingCount" minmax="10000,10000" subset="4" />
        </template>
      </div> -->
      <div class="absolute overlay flex items-center justify-center bg-black">
        <span class="animate-pulse">loading #{{ tokenId }}</span>
      </div>
      
      <figure ref="container" :class="['absolute overlay overflow-scroll border border-neutral-900', {'pointer-events-none': loading}]">
        <img ref="img" :src="`https://travess2.netlify.app/demo/art/full/full${tokenId}.png`" @load="onImgLoad" :class="['max-w-none block origin-center transition-opacity duration-[2000ms] delay-[2000ms] bg-black', {'absolute overlay object-contain object-center cursor-zoom-in': fitInWindow, 'cursor-zoom-out': !fitInWindow, 'opacity-0 pointer-events-none': loading}]" @click="onImgClick" />
        <!-- <div class="absolute top-0 left-0 bg-black">zoom_100</div> -->
      </figure>
    </div>
  </article>
</template>

<style scoped>
</style>