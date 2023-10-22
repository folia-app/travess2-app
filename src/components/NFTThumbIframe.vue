<template lang="pug">
observer.block.absolute.overlay.flex.items-center.justify-center.overflow-hidden(v-if="isObserving", :threshold="0.01", @visible="onVisible", @hidden="onHidden")
  .text-3xs(:class="!loadError && 'animate-pulse'") {{ loadError ? loadError : id.toString().length < 3 ? `#${id}` : '🐍' }}
  template(v-if="visible && iframeSrc")
    iframe.absolute.overlay.object-contain.pointer-events-none(:src="iframeSrc")
    //- | {{ id }}:{{ iframeSrc }}
  //- template(v-if="imgSrc && visible")
    img.absolute.overlay.object-contain.object-center(:src="imgSrc", @load="imgLoaded = true", @error="onError", :class="{'opacity-0': !imgLoaded}")
    
</template>

<script>
import Observer from './Observer.vue'
export default {
  name: 'NFTThumbIframe',
  props: ['id'],
  components: { Observer },
  data () {
    return {
      visible: false,
      imgSrc: undefined,
      imgLoaded: false,
      isObserving: false,
      waitToObserve: undefined,
      visibleTimeout: null,
      loadError: undefined
    }
  },
  computed: {
    iframeSrc () {
      // /api/get/iframe?#<token-id>
      return `${import.meta.env.VITE_SERVER}/get/iframe?#${this.id}`
    }
  },
  methods: {
    onVisible () {   
      const reveal = () => {
        this.visible = true
        this.loadImage() 
      }

      if (!this.imgLoaded) {
        // add timeout to throttle fast scrolling
        this.visibleTimeout = setTimeout(reveal, 300)
      } else {
        reveal()
      }
    },
    onHidden () {
      clearTimeout(this.visibleTimeout)
      this.visible = false
    },
    loadImage () {
      if (this.imgSrc) return
      // this.$store.dispatch('getCableImage', { id: this.id.toString() })
      //   .then(imgSrc => this.imgSrc = imgSrc)

      this.imgSrc = `${import.meta.env.VITE_SERVER}/get/img/${this.id}`
    },
    onError (e) {
      console.log(e)
      this.loadError = '⚠️'
    }
  },
  mounted () {
    setTimeout(() => { this.isObserving = true }, 100)
  },
  watch: {
    '$route' (to, from) {
      if (to.query.sort !== from.query.sort) {
        // refresh observer because toggling newest/oldest sort causes it to freeze out on false :(
        this.isObserving = false
        this.waitToObserve = setTimeout(() => { this.isObserving = true }, 100)
      }
    }
  }
}
</script>

<style>
</style>
  