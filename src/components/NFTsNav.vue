<template>
  <nav class="flex rounded-stroke bg-pencil-6h overflow-hidden text-h6 md:text-h5b">
    <router-link :to="{name: 'nfts-index'}" class="h-16 md:h-20 w-1/2 mlg:w-44 flex justify-center items-center" :class="$route.name === 'nfts-index' ? 'bg-pen text-white' : 'mouse:hover:bg-pencil-5h'">ALL</router-link>
    <router-link :to="{name: 'nfts-yours'}" class="h-16 md:h-20 w-1/2 mlg:w-44 flex justify-center items-center" :class="$route.name === 'nfts-yours' ? 'bg-pen text-white' : 'mouse:hover:bg-pencil-5h'">YOURS</router-link>
  </nav>
</template>