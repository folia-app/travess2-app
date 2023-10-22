<template>
  <article class="min-h-screen bg-white p-stroke-lt flex">
    <div class="border border-stroke rounded-stroke3x w-full p-4 md:p-10 relative">
      <section class="flex flex-wrap gap-2 md:gap-10">
        <!-- image -->
        <figure class="w-full md:flex-1">
          <!-- <div v-my-directive class="relative w-full aspect-square bg-pencil-6h" id="sketch-holder"></div> -->
          <iframe :key="$route.params.tokenId + length" :src="iframeBaseURI + '/get/iframe#' + $route.params.tokenId + '-' + length" class="relative w-full aspect-square bg-pencil-6h" frameborder="0"></iframe>
        </figure>
        <!-- info -->
        <div class="w-full md:flex-1 flex flex-col gap-1 md:gap-3">
          <header class="text-h3 md:text-h2 flex items-center w-full pr-10 gap-5">
            <h1 class=" uppercase">{{ meta.name ?? `NFT #${$route.params.tokenId}` }}</h1>
            <a :href="$store.getters.openSeaLink({ tokenId: $route.params.tokenId })" class="text-pencil-3h mouse:hover:text-pen" title="view on opensea" target="_blank" rel="noopener noreferrer">
              <SvgOpenSea style="height:0.7em" stroke-width="7"/>
            </a>
          </header>
          <ul class="flex-1 flex flex-col gap-1.5 text-h6 md:text-h5b">
            <li class="flex-1 flex gap-5 px-2 md:px-8 rounded-stroke justify-between items-center bg-pencil-6h">
              <div>owner</div>
              <div class="flex-1 min-w-0 truncate text-h6 md:text-h4 text-right">
                <router-link v-if="owner" :to="userIsOwner ? {name: 'nfts-yours'} : {name: 'nfts-profile', params: {address: owner}}" class="underline">
                  <Addr :address="owner" :youOn="true" />
                </router-link>
                <span v-else>...</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <button class="absolute top-0 right-0 p-0.5 md:p-5" @click="goBack()" aria-label="Back / Home">
        <SvgX class="h-12" stroke-width="5" />
      </button>
    </div>
  </article>
</template>

<script setup>
  // import p5 from 'p5'
  import { computed } from 'vue';
  import SvgX from '@/components/SvgX.vue'
  import { useRoute } from 'vue-router';
  import store from '@/store'
  import Addr from '../components/Addr.vue';
  import SvgOpenSea from '../components/SvgOpenSea.vue';

  const route = useRoute()
  const nft = computed(() => store.state.nfts.find(v => v.tokenId.toString() === route.params.tokenId))
  const owner = computed(() => nft.value?.owner)
  const userIsOwner = computed(() => owner.value?.toLowerCase() === store.getters.address?.toLowerCase())

  const iframeBaseURI = import.meta.env.VITE_SERVER
  const meta = store.state.nfts.find(v => v.tokenId.toString() === route.params.tokenId)

</script>

<script>
  let lastRt
  export default {
    metaInfo() {
        const title = meta.name; // geoJSON.features.find(f => f.id === this.$route.params?.tokenId?.toString())?.properties.name
        const img = undefined; // this.$store.getters.metaImage(this.$route.params.tokenId)
        setTimeout(() => { window.prerenderReady = true; }, 200);
        return this.$store.getters.meta({ title, img });
    },
    methods: {
        goBack() {
            if (lastRt?.name) {
                return this.$router.go(-1);
            }
            this.$router.push("/");
        }
    },
    beforeRouteEnter(to, from, next) {
        lastRt = from;
        next();
    },
    components: { SvgOpenSea }
}
</script>
