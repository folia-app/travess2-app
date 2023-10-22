<template>
  <section class="nfts w-full flex flex-col p-4 gap-5 sm:p-6 sm:gap-6 mlg:p-8 mlg:gap-7">
    <router-view :key="$route.path"></router-view>
  </section>
</template>

<script setup>
</script>