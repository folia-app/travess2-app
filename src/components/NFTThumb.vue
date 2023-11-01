<template>
  <router-link :to="`/tokens/${props.id}`" class="group btn-highlight" :class="{'ring-1 ring-white': props.outline}" @mouseenter="$emit('mouseenter', props.id)" @mousemove="e => $emit('mousemove', e)" @mouseleave="$emit('mouseleave')">
    ({{ tokenTitles[props.id].replace(',', ', ') }})
    <img class="inline-block h-[1.1em] transform -translate-y-[0.1em] align-middle mouse:group-hover:outline" :src="`/thumbs/tiny/${props.id}.jpg`" />
    #{{ ('000' + props.id).slice(-3) }}
  </router-link> 
  <!-- / -->
  <!-- token link -->
  <!-- <a :href="$store.getters.openSeaLink({ account: token.owner })" :class="['group btn-underline']" target="_blank" rel="noopener noreferrer" @mouseenter="mouseenter('view-token:' + props.id)" @mousemove="moveTooltip" @mouseleave="hideTooltip">opensea</a> -->
  /
  <!-- owner link -->
  <a :href="$store.getters.openSeaLink({ tokenId: props.id })" :class="['btn-underline', {'bg-white text-black': token?.owner.toLowerCase() === $store.getters.address?.toLowerCase()}]" target="_blank" rel="noopener noreferrer" @mouseenter="$emit('mouseenter', 'view-owner')" @mousemove="e => $emit('mousemove', e)" @mouseleave="$emit('mouseleave')">
    <Addr :address="token.owner" />
  </a>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { computed, watch } from 'vue'
import store from '@/store'
import tokenTitles from '../metadata/titles.js'
import Addr from '../components/Addr.vue'

const props = defineProps(['id', 'outline'])
const emit = defineEmits(['mouseenter', 'mousemove', 'mouseleave'])

const token = computed(() => store.state.nfts.find(nft => nft.tokenId.toString() === props.id.toString()))
watch(token, () => console.log(props.id))
</script>