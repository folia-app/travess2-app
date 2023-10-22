<template>
  <div class="flex flex-col uppercase group" style="width: calc(100% + var(--stroke-w)); margin-left: calc(var(--stroke-w) / -2)">
    <div class="flex">
      <RoundedCorner :key="'topleft'"></RoundedCorner>
      <div class="flex-1 border-t-stroke border-current"></div>
      <RoundedCorner :key="'topright'" class="transform -scale-x-100"></RoundedCorner>
    </div>
    
    <div class="flex-1 w-full border-l-stroke border-r-stroke border-current flex items-center justify-center">
      <slot></slot>
    </div>

    <div class="w-full">
      <div class="flex bg-white relative" :class="isActive && 'bg-white'" style="width: calc(100% + var(--stroke-w) * 4); margin-left: calc(-1 * (var(--stroke-w) * 2))">
        <RoundedCorner :key="'bottomleft'" class=" transform -scale-x-100 -scale-y-100"></RoundedCorner>
        <div class="flex-1"></div>
        <RoundedCorner :key="'bottomleft'" class=" transform -scale-y-100"></RoundedCorner>
        <!-- complete top edge of page -->
        <div v-show="!isActive" class="absolute w-full z-10 bottom-0 left-0 h-stroke bg-black"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import RoundedCorner from '@/components/RoundedCorner.vue'
const props = defineProps(['isActive'])
</script>