<script setup lang="ts">
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>
<template>
  <button
    type="button"
    class="fixed size-12 aspect-square rounded-full z-[21] bg-black text-white lg:hidden bottom-3 right-4 flex justify-center items-center"
    @click="scrollToTop"
  >
    <SvgoArrowRight class="-rotate-90 text-[1.5rem] !mb-0" filled />
  </button>
</template>
