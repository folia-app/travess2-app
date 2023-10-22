<template>
  <ol class="inline">
    <!-- txs... -->
    <template v-for="tx in txs" :key="tx.txHash">
      <li class="inline">
        <TxRow v-if="tx.status == 'success'">
          <span class="text-[#9cf240]"> MINTED!!</span> (see below)
          <!-- {{ tx.name}}!!  -->
          <!-- <router-link v-if="tx.name === 'mint'" to="/nfts/yours" class="">view </router-link> -->
        </TxRow>
        <TxRow v-else-if="tx.status == 'pending'">
          <span class="animate-blink">pending {{ tx.name }}...</span> <a :href="etherscanLink(tx)" target="_blank" rel="noopener noreferrer" class="underline">view tx</a>
        </TxRow>
        <TxRow v-else-if="tx.status == 'error'" class="text-red-600">
          {{ tx.name}} failed! <a :href="etherscanLink(tx)" target="_blank" rel="noopener noreferrer" class="underline">tx</a>
        </TxRow>
        <TxRow v-else class="text-underline">
          {{tx.status}} {{ tx.name }}: <a :href="etherscanLink(tx)" target="_blank" rel="noopener noreferrer" class="underline">tx</a>
        </TxRow>
      </li>
      <GlyphsRand minmax="3,5" />
    </template>
  </ol>
</template>

<script setup>
import GlyphsRand from './GlyphsRand.vue';
import TxRow from './TxRow.vue';
import store from '@/store'
// import SvgArrowUpRight from './SvgArrowUpRight.vue';

const { txs } = defineProps(['txs'])
const etherscanLink = ({ txHash }) => store.getters.etherscanLink(txHash)
</script>