<script setup lang="ts">
import { FeatureMainMenu } from "~/features/main-menu";
import { FeatureSearch } from "~/features/search";

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
    class="absolute ui-header left-0 top-0 z-30 bg-transparent w-full flex justify-center"
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
