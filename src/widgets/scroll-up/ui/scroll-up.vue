<script setup lang="ts">
const isTop = ref(true);

onMounted(() => {
  document.addEventListener("scroll", () => {
    if (isTop.value === true) {
      if (window.scrollY > 40) isTop.value = false;
    } else {
      if (window.scrollY <= 40) isTop.value = true;
    }
  });
});
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>
<template>
  <Transition name="fade" mode="out-in" appear>
    <button
      v-if="!isTop"
      type="button"
      class="fixed size-12 aspect-square rounded-full z-[21] bg-black text-white lg:hidden bottom-3 right-4 flex justify-center items-center"
      @click="scrollToTop"
    >
      <SvgoArrowRight class="-rotate-90 text-[1.5rem] !mb-0" filled />
    </button>
  </Transition>
  <div
    class="hidden pointer-events-none px-4 lg:flex justify-end fixed left-1/2 -translate-x-1/2 bottom-5 z-[21] container"
  >
    <Transition name="fade" mode="out-in" appear>
      <button
        v-if="!isTop"
        type="button"
        class="bg-white pointer-events-auto cursor-pointer shadow-[0_4px_10px_0_rgba(74,74,74,0.15)] size-12 aspect-square rounded-full text-black flex justify-center items-center"
        @click="scrollToTop"
      >
        <SvgoChevron class="-rotate-90 text-[1.5rem] !mb-0" filled />
      </button>
    </Transition>
  </div>
</template>
