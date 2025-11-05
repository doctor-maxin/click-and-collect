<script setup lang="ts">
import { NavigationRenderType, NavigationItemType } from "#gql/default";

const { data: footerMenu } = await useAsyncData(
  "footer-menu",
  () =>
    GqlRenderNavigation({
      type: NavigationRenderType.TREE,
      navigationIdOrSlug: "footer-menu",
    }),
  {
    transform: (r) => r.renderNavigation?.filter((c) => !!c) ?? [],
  },
);

const getItemUrl = (
  type: NavigationItemType | undefined,
  path: string | undefined | null,
  typename: string | undefined,
) => {
  if (type === NavigationItemType.EXTERNAL) {
    return `${path}`;
  }
  if (type === NavigationItemType.INTERNAL) {
    if (typename === "Page") {
      return `/pages/${path?.startsWith("/") ? path.slice(1) : path}`;
    }
  }
  return `/${path?.startsWith("/") ? path.slice(1) : path}`;
};

const socialLinks = computed(() =>
  footerMenu.value?.find((item) => item?.additionalFields?.isSocialMenu),
);
const defaultLinks = computed(() =>
  footerMenu.value
    ?.filter((item) => !item?.additionalFields?.isSocialMenu)
    ?.slice(0, 1),
);
</script>
<template>
  <div class="mt-auto w-full flex flex-col gap-9">
    <section v-for="(menu, index) of defaultLinks ?? []" :key="menu?.id">
      <nav>
        <ul class="flex flex-col gap-3">
          <li v-for="item of menu?.items" :key="item?.id">
            <NuxtLink
              class="text-[1.25rem] cursor-pointer leading-6 font-medium"
              :to="
                getItemUrl(item?.type, item?.path, item?.related?.__typename)
              "
              >{{ item?.title }}</NuxtLink
            >
          </li>
        </ul>
      </nav>
    </section>
    <nav v-if="socialLinks" class="">
      <ul class="flex gap-3 flex-wrap">
        <li v-for="item of socialLinks.items" :key="item?.id">
          <NuxtLink
            :to="getItemUrl(item?.type, item?.path, item?.related?.__typename)"
            class="cursor-pointer"
          >
            <figure class="w-9 aspect-square">
              <img :src="item?.additionalFields?.icon!" />
              <figcaption class="hidden">
                {{ item?.title }}
              </figcaption>
            </figure>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
