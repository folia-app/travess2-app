<script setup>
import { ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
const transitionName = ref('none')

watch(() => route.name, (to, from) => {
  transitionName.value = to === 'token' && from === 'token' ? 'fade'
    : 'none'
})
</script>

<template>
  <div class="text-xl leading-[1.3] lg:leading-[1.05] tracking-wide">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<style>
.fade-leave-active{
  transition:opacity 500ms;
  z-index: 30;
}
.fade-enter-active{
  transition:opacity 100ms 500ms;
}
.fade-leave-to,
.fade-enter-from{
  opacity:0;
}
</style>

