<script setup lang="ts">
import PopularProducts from "./popular-products.vue";
import SearchInput from "./search-input.vue";

const isOpen = ref(false);
const headerOffset = ref(0);
const isMobile = ref(false);
const route = useRoute();
let bodyOverflowBeforeLock = "";
let bodyPaddingRightBeforeLock = "";

const updateMobileState = () => {
  const header = document.querySelector(".ui-header");
  if (!(header instanceof HTMLElement)) return;
  headerOffset.value = header.getBoundingClientRect().bottom;
  isMobile.value = window.matchMedia("(max-width: 1023px)").matches;
};

const lockBodyScroll = () => {
  bodyOverflowBeforeLock = document.body.style.overflow;
  bodyPaddingRightBeforeLock = document.body.style.paddingRight;
  document.body.style.overflow = "hidden";
};

const unlockBodyScroll = () => {
  document.body.style.overflow = bodyOverflowBeforeLock;
  document.body.style.paddingRight = bodyPaddingRightBeforeLock;
};

onMounted(() => {
  updateMobileState();
  window.addEventListener("resize", updateMobileState, { passive: true });
  window.addEventListener("scroll", updateMobileState, { passive: true });
});

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      updateMobileState();
      if (isMobile.value) lockBodyScroll();
    });
    return;
  }

  unlockBodyScroll();
});

watch(
  () => route.fullPath,
  () => {
    isOpen.value = false;
  },
);

onBeforeUnmount(() => {
  unlockBodyScroll();
  window.removeEventListener("resize", updateMobileState);
  window.removeEventListener("scroll", updateMobileState);
});
</script>
<template>
  <div class="relative z-20">
    <button type="button" class="cursor-pointer" @click="isOpen = !isOpen">
      <SvgoClose v-if="isOpen" filled class="text-2xl" />
      <SvgoSearch v-else filled class="text-2xl" />
    </button>
    <Teleport to="body">
      <button
        v-if="isOpen"
        type="button"
        class="fixed inset-x-0 bottom-0 z-[25] bg-white"
        :style="{ top: `${headerOffset}px` }"
        aria-label="Закрыть поиск"
        @click="isOpen = false"
      />
      <div
        v-if="isOpen"
        class="fixed inset-x-0 bottom-0 z-[26] overflow-y-auto box-border py-6 lg:py-9 bg-white"
        :style="{ top: `${headerOffset}px` }"
      >
        <div
          class="container px-4 grid grid-cols-1 lg:grid-cols-2 gap-4 mx-auto"
        >
          <div class="order-1 lg:order-2 lg:pl-[7.75rem]">
            <SearchInput @close="isOpen = false" />
          </div>
          <div class="order-2 lg:order-1">
            <PopularProducts @close="isOpen = false" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
