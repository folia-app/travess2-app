<template>
  <header class="flex flex-wrap w-full justify-between gap-inherit">
    <NFTsNav class="w-full mlg:w-auto" />
    <NFTsFeedActions class="w-full mlg:w-auto" :count="mintCount" />
  </header>

  <!-- list -->
  <template v-if="mintCount !== undefined">
    <!-- grid -->
    <NFTsGrid>
      <template v-for="n in 1">
        <template v-for="id in mintIdsSorted.slice(0, Math.min(pageSize, mintCount))" :key="id">
          <!-- items... -->
          <NFTThumb :id="id" :rt="{name: 'token', params: { tokenId: id }}"></NFTThumb>
        </template>
      </template>
    </NFTsGrid>
    
    <!-- lazy page loader -->
    <Observer v-if="pageSize < mintCount" class="min-h-[90vh] flex items-center justify-center text-3xs animate-pulse" :threshold="0.01" @visible="renderNextPage">
      <div class="sticky bottom-8 left-0 w-full text-center">loading...</div>
    </Observer>
  </template>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import NFTThumb from '../components/NFTThumb.vue';
import store from '../store';
import { useRoute, useRouter } from 'vue-router'
import Observer from '../components/Observer.vue';
import NFTsNav from '../components/NFTsNav.vue';
import NFTsGrid from '../components/NFTsGrid.vue';
import NFTsFeedActions from '../components/NFTsFeedActions.vue';

const route = useRoute()
const router = useRouter()
const emit = defineEmits(['sortChange'])

// mint count
const mintCount = computed(() => store.getters.mintCount) // ref(store.state.mintCount)

// make array of tokenIds from mint count
const mintIdsSorted = computed(() => {
  const mintIds = store.state.nfts.sort((a, b) => {
    if (route.query.sort === 'newest') {
      return b.tokenId - a.tokenId
    } else if (route.query.sort === 'shortest') {
      return a.length - b.length
    } else if (route.query.sort === 'oldest') {
      return a.tokenId - b.tokenId
    } else { // longest
      return b.length - a.length
    } 
  }).map(v => v.tokenId)
  return mintIds
})

// lazyload "page" size
const pageSizeStep = ref(20)
const pageSize = ref((route.query.page ?? 1) * pageSizeStep.value)

function renderNextPage () {
  pageSize.value = pageSize.value + pageSizeStep.value
  router.replace({ query: { ...route.query, page: pageSize.value / pageSizeStep.value }})
}

watch(() => route.query, (newVal, oldVal) => {
  if (newVal.sort !== oldVal.sort) {
    // reset pageSize
    pageSize.value = pageSizeStep.value
    router.replace({ query: { ...route.query, page: undefined }})
  }
})

</script>