<script setup>
  import { ref } from 'vue';

  const props = defineProps({
    minmax: {
      type: String,
      default: '3,30'
    },
    subset: {
      type: String,
      default: '0'
    }
  })

  const min = Number(props.minmax.split(',')[0])
  const max = Number(props.minmax.split(',')[1])
  
  
  // const glyphsSpecial = ".,•·?!/:;/\\()-–—_‚„“”‘’«»'+−×&@™çæâ\"œô"
  const glyphsLight = `      .,··-–—-–—___:;+×−`
  const glyphsMed = `‚„“”‘’«»ºª'`
  const glyphsHeavy = "()ı•" // #&?!\\/
  const glyphsRare = "'abcdefghijklmnopqrstuvwxyz234567890'" // 1 // "çæâœôûqöêŒÔÊÆë" // @πƒ∆Ω™
  const glyphSet = [
    Array(1).fill(glyphsRare).join(),
    Array(20).fill(glyphsHeavy).join(),
    Array(40).fill(glyphsMed).join(),
    Array(60).fill(glyphsLight).join(),
  ].slice(-Number(props.subset)).join()

  function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  function glyphSpan (min = 3, max = 30) {
    const array = Array(randomIntFromInterval(min, max)).fill(0)
    return array.map((_, i) => {
      if (!i || i === array.length - 1) {
        // first and last glyph come from light pack (so no ugliness with other words)
        return glyphsLight[randomIntFromInterval(0, glyphsLight.length - 1)]
      }
      // else full set
      return glyphSet[randomIntFromInterval(0, glyphSet.length - 1)]
    }).join('')
  }

  const glyphs = ref()

  glyphs.value = glyphSpan(min, max)
</script>

<template>
  {{ glyphs }}
</template>