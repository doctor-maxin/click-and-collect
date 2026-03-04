<script setup lang="ts">
import { FeatureMainMenu } from "~/features/main-menu";
import { FeatureSearch } from "~/features/search";

const isHeaderVisible = ref(true);
const lastScrollY = ref(0);

const onScroll = () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY <= 40) {
    isHeaderVisible.value = true;
    lastScrollY.value = currentScrollY;
    return;
  }

  if (currentScrollY > lastScrollY.value) {
    isHeaderVisible.value = false;
  } else if (currentScrollY < lastScrollY.value) {
    isHeaderVisible.value = true;
  }

  lastScrollY.value = currentScrollY;
};

onMounted(() => {
  lastScrollY.value = window.scrollY;
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});

const client = useStrapiClient();
await useAsyncData(
  "main-menu",
  () =>
    client
      .single("navigation/render/main-menu?type=TREE")
      .find() as unknown as Promise<NavigationMenu>,
);
</script>
<template>
  <div
    class="fixed ui-header left-0 top-0 z-30 bg-transparent w-full flex justify-center transition-transform duration-200"
    :class="isHeaderVisible ? 'translate-y-0' : '-translate-y-full'"
  >
    <div
      class="container px-4 py-2 lg:py-5 items-center text-black grid grid-cols-[1.5rem_auto_1.5rem]"
    >
      <FeatureMainMenu />

      <NuxtLink to="/" class="mx-auto">
        <SvgoLogo
          class="h-12 lg:h-[5.625rem] mx-auto"
          :fontControlled="false"
        />
      </NuxtLink>
      <FeatureSearch />
    </div>
  </div>
</template>
