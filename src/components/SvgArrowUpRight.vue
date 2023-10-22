<template>
<svg viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio>
<path d="M3 28.9042C5.75585 25.748 8.701 21.9542 10.8916 20.4205C13.463 18.6202 15.3166 16.4885 17.4339 14.1825C19.3117 12.1374 20.5405 9.41729 22.9071 7.9445C24.295 7.08076 25.7019 4.90665 26.3692 3.45312" stroke="currentColor" :stroke-width="strokeWidth" stroke-linecap="round"/>
<path d="M6.4209 6.15598C9.69419 6.15598 13.0745 5.70513 16.2565 5.70513C19.486 5.70513 22.7547 3 25.8829 3C27.6911 3 26.5107 7.03729 26.5107 8.66073C26.5107 10.3807 26.5107 12.1006 26.5107 13.8205C26.5107 16.854 26.9768 20.4297 26.0922 23.2885" stroke="currentColor" :stroke-width="strokeWidth" stroke-linecap="round"/>
</svg>
</template>

<script setup>
const { strokeWidth } = defineProps({
  strokeWidth: 4
})
</script>