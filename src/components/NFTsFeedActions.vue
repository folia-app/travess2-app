<template>
  <div class="flex gap-4 h-16 md:h-20 text-h6 md:text-h5b">
      <!-- count -->
      <div class="bg-pencil-6h flex items-center justify-center rounded-stroke min-w-20 px-6 sm:flex-1 border-stroke border-pencil-6h">
        <span v-if="count === undefined" class="animate-pulse">...</span>
        <span v-else>{{ count }}</span>
      </div>
      <!-- sort -->
      <template v-if="count > 1">
        <button class="flex-1 px-6 border border-stroke-sm rounded-stroke flex items-center justify-center gap-2 uppercase" @click.prevent="toggleSort">
          <div>
            {{ route.query.sort ?? 'newest' }}
          </div> 
          <div>
            <SvgArrowDown stroke-width="6" class="w-6"/>
          </div>
        </button>
      </template>
    </div>
</template>

<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import SvgArrowDown from '@/components/SvgArrowDown.vue'

  defineProps({
    count: undefined
  })

  const route = useRoute()
  const router = useRouter()
  const sorting = [
    'newest',
    'oldest',
  ]

  function toggleSort () {
    let sortIndex = sorting.indexOf(route.query.sort)
    if (sortIndex === -1) sortIndex = 0
    sortIndex = (sortIndex + 1) % sorting.length
    router.replace({
      query: {
        ...route.query,
        sort: sorting[sortIndex]
      }
    })
  }
</script>