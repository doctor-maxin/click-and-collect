<script setup lang="ts">
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>
<template>
  <button
    type="button"
    class="fixed z-20 text-base capitalize bg-white/80 lg:hidden bottom-0 left-0 w-full p-3 flex justify-center items-center"
    @click="scrollToTop"
  >
    Вернуться наверх
    <SvgoArrowRight class="-rotate-90 text-[1.5rem] !mb-0" filled />
  </button>
</template>
