<template>
  <article class="faq w-full p-stroke3x text-h6 md:text-h4">
    <h1 class="sr-only">FAQ</h1>
    <section class="children-mt-em">
      <!-- sections... -->
      <details v-for="section in faq" class="mb-[1.5em]">
        <!-- heading -->
        <summary class="text-h5b md:text-h3 cursor-pointer select-none uppercase">{{ section.heading }}</summary>
        <!-- (body) -->
        <div class="children-mt-em rounded-stroke3x bg-pencil-6h p-stroke3x mt-[0.5em]">
          <p v-for="paragraph in section.body" v-html="paragraph"></p>
        </div>
      </details>
    </section>
    <footer class="flex flex-wrap gap-1 text-h5b md:text-h4">
      <a class="w-full md:flex-1 border border-stroke-sm rounded-stroke h-20 md:h-24 flex items-center justify-center mouse:hover:bg-pencil-6h" href="https://etherscan.io/address/XXXXXXXXXXX" target="_blank" rel="noopener noreferrer">Contract</a>
      <a class="w-full md:flex-1 border border-stroke-sm rounded-stroke h-20 md:h-24 flex items-center justify-center mouse:hover:bg-pencil-6h" href="https://opensea.io/collection/nft" target="_blank" rel="noopener noreferrer">OpenSea</a>
    </footer>
  </article>
</template>

<script setup>
const faq = [
  {
    heading: 'What is "NFT"?',
    body:
      [
        `NFT is a...`,
        // `a new paragraph with a <a>link</a>`
      ] 
  },
  {
    heading: 'Where can I mint?',
    body:
      [
        `You can mint on this webapp or on <a href="https://mint.fun/ethereum/XXXXXXXXXX" target="_blank" rel="noopener noreferrer" class="underline">mint.fun</a>`
      ] 
  },
  {
    heading: 'I need help...',
    body:
      [
        `Ask a question in our <a href="${import.meta.env.VITE_DISCORD_LINK}" target="_blank" rel="noopener noreferrer" class="underline">Discord</a>.`
      ] 
  },
]
</script>

<style>
.faq section ul{
  @apply list-disc;
  padding-left: 0.5em;

  & li + li {
    margin-top:0.5em;
  }
}
</style>
