<template>
<div class="header">
  <button @click="connect">connect</button>
  <button @click="disconnect">disconnect</button>
  <button @click="mint(1)">mint</button>
  <button @click="mintAllowList(1)">mintAllowList</button>
  <button @click="getNFTBalance">getNFTBalance</button>
  <div>{{ network || "no-network" }}</div>
  <div>{{ address || "no-address" }}</div>
  <div>{{ canWrite ? "canWrite" : "!canWrite" }}</div>
  <div class="clear">
    <button @click="changePage(-1)">prev</button>
    <button @click="changePage(1)">next</button>
    {{ page }} / {{ Math.ceil(sortedNFTs.length / perPage) }}
  </div>
  <div class="nft" v-for="nft in paginatedNFTs" :key="nft.tokenId">
    <hr>
    <div class="stats">tokenId: {{ nft.tokenId }}</div>
    <div class="stats">owner: {{  nft.owner }}</div>
    <div class="clear"></div>
  </div>
</div>
</template>

<script>


import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'Web3Connect',
  data() {
    return {
      page: 1,
      perPage: 4
    }
  },
  props: {},
  computed: {
    paginatedNFTs() {
      return this.nfts.slice((this.page - 1) * this.perPage, this.page * this.perPage)
    },
    ...mapState(['network', 'nfts', 'baseURI']),
    ...mapGetters(['addrShort', 'ethToWei', 'weiToEth', 'address', 'canWrite'])
  },
  methods: {
    changePage(amount) {
      this.page += amount
      if (this.page < 1) this.page = 1
      if (this.page > Math.ceil(this.nfts.length / this.perPage)) this.page = Math.ceil(this.nfts.length / this.perPage)
    },
    ...mapActions(['connect', 'disconnect', 'getNFTBalance', 'mint', 'mintAllowList'])
  },


}
</script>
<style scoped>
  img {
    width: 323px;
    float:left;
    margin: 10px;
  }
  .stats {
    margin: 10px;
  }
  .clear {
    clear: both;
  }
  .nft {
    max-width: 620px;
    width: 50%;
    display: inline-block;
  }
</style>