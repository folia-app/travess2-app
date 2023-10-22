<template>
  <div class="profile-address-bar-vue relative rounded-stroke px-4 md:px-5 justify-between" :class="theme.base">
    <div class="relative">
      <div class="pt-1 w-full text-[18px] md:text-h6 md:pt-4 flex items-center justify-between mlg:absolute mlg:w-auto mlg:top-0 mlg:left-0 mlg:h-full mlg:pt-0">
        <span v-if="context === 'connected'">connected:</span>
        <span v-else>collection of:</span>

        <button class="h-12 w-12 -mr-2 flex items-center justify-center mlg:hidden rounded-xl" :class="theme.hover" @click="$emit('closeButtonClick')">
          <SvgX stroke-width="5" class="h-6 md:h-8" />
        </button>
      </div>
      
      <div class="h-20 md:h-24 flex-1 flex items-center gap-2 mlg:justify-center mlg:px-[10em]">
        <div class="flex-1 min-w-0 flex items-center">
          <div class="w-full text-h4 md:text-h3 truncate leading-none mlg:text-center">
            <Addr :address="address" />
          </div>
        </div>
        <div class="flex gap-6 items-center justify-center mlg:absolute top-0 right-0 h-full">
          <a class="-mr-1 h-12 w-12 rounded-xl flex items-center justify-center mlg:mr-0" :class="theme.osLogo" :href="`https://opensea.io/accounts/${address}`" target="_blank" rel="noopener noreferrer">
            <SvgOpenSea class="h-[2.6em]" stroke-width="7" />
          </a>
          <button class="hidden mlg:flex items-center justify-center mlg:static mlg:w-12 mlg:h-12 rounded-xl" :class="[theme.hover, {'mlg:hidden': context !== 'connected'}]" @click="$emit('closeButtonClick')">
            <SvgX stroke-width="5" class="h-6 mlg:h-9" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Addr from '../components/Addr.vue'
import SvgOpenSea from '../components/SvgOpenSea.vue'
import SvgX from '../components/SvgX.vue'

const { address, context } = defineProps(['address', 'context'])

const emit = defineEmits(['closeButtonClick'])

const theme = context === 'connected' ? {
  base: 'bg-blue-100 text-blue-500',
  hover: 'mouse:hover:bg-blue-200',
  osLogo: 'text-blue-300 mouse:hover:text-blue-500'
} : {
  base: 'bg-pencil-6h text-pen',
  hover: 'mouse:hover:bg-pencil-5h',
  osLogo: 'text-pencil-3h mouse:hover:text-pen'
}
</script>