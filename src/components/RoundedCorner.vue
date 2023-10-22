<template>
  <div class="rounded-corner-vue w-stroke3x h-stroke3x overflow-hidden" style="">
    <div class="inner rounded-stroke3x">
    </div>
  </div>
</template>

<style scoped>
  .inner{
    /* border-radius:calc(var(--stroke-w) * 3); */
    width:200px;
    height:200px;
    border-left:var(--stroke-w) solid currentColor;
    border-top:var(--stroke-w) solid currentColor;
    /* background:transparent; */
    @apply pointer-events-none;
  }
</style>

