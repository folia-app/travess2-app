<template>
  <ul class="tx-list flex flex-col gap-1.5 normal-case">
    <!-- txs... -->
    <template v-for="n in 1">
      <li v-for="tx in txs" :key="tx.txHash" >
        <TxRow v-if="tx.status == 'success'" class="bg-green-200">
          successful {{ tx.name}}!! <router-link v-if="tx.name === 'mint'" to="/nfts/yours" class="mouse:hover:underline flex gap-2 items-center">view </router-link>
        </TxRow>
        <TxRow v-else-if="tx.status == 'pending'" class="bg-amber-100 animate-pulse">
          pending {{ tx.name }}... <a :href="etherscanLink(tx)" target="_blank" rel="noopener noreferrer" class="mouse:hover:underline flex gap-2 items-center">tx <SvgArrowUpRight style="height:0.9em" stroke-width="4" /></a>
        </TxRow>
        <TxRow v-else-if="tx.status == 'error'" class="bg-red-200">
          failed {{ tx.name}}! <a :href="etherscanLink(tx)" target="_blank" rel="noopener noreferrer" class="mouse:hover:underline flex gap-2 items-center">tx <SvgArrowUpRight style="height:0.9em" stroke-width="4" /></a>
        </TxRow>
        <TxRow v-else class="bg-pencil-3h">
          {{tx.status}} {{ tx.name }}: <a :href="etherscanLink(tx)" target="_blank" rel="noopener noreferrer" class="mouse:hover:underline flex gap-2 items-center">tx <SvgArrowUpRight style="height:0.9em" stroke-width="4" /></a>
        </TxRow>
      </li>
    </template>
  </ul>
</template>

<script setup>
import TxRow from './TxRow.vue';
import { computed } from 'vue'
import store from '@/store'
import SvgArrowUpRight from './SvgArrowUpRight.vue';

const { txs } = defineProps(['txs'])
const etherscanLink = ({ txHash }) => store.getters.etherscanLink(txHash)
</script>