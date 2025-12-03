<script setup lang="ts">
import { NavigationRenderType, NavigationItemType } from "#gql/default";

const { data: config } = useNuxtData("config");
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
  footerMenu.value?.filter((item) => !item?.additionalFields?.isSocialMenu),
);
</script>
<template>
  <footer class="hidden lg:block pb-8 pt-14">
    <div
      class="container px-4 mx-auto grid additionalFields grid-cols-12 gap-4"
    >
      <section
        v-for="(menu, index) of defaultLinks ?? []"
        :key="menu?.id"
        :class="{
          'col-span-4': index === 1,
          'col-span-2': index !== 1,
        }"
      >
        <span class="text-base block mb-5 font-semibold leading-5">{{
          menu?.title
        }}</span>
        <nav>
          <ul class="flex flex-col gap-3">
            <li v-for="item of menu?.items" :key="item?.id">
              <NuxtLink
                class="text-base cursor-pointer leading-5"
                :to="
                  getItemUrl(item?.type, item?.path, item?.related?.__typename)
                "
                >{{ item?.title }}</NuxtLink
              >
            </li>
          </ul>
        </nav>
      </section>
      <section class="col-span-3 flex flex-col gap-7 col-start-10">
        <NuxtLink to="/">
          <SvgoLogo :fontControlled="false" class="w-[6rem]" />
        </NuxtLink>
        <div class="flex gap-3 flex-col leading-5 text-base">
          <address class="not-italic">
            {{ config?.config?.address }}
          </address>
          <span
            >E-mail:
            <NuxtLink :to="`mailto:${config?.config?.email}`">
              {{ config?.config?.email }}
            </NuxtLink>
          </span>
          <NuxtLink :to="`tel:${config?.config?.phone}`">
            {{ config?.config?.phone }}
          </NuxtLink>
        </div>
      </section>
    </div>
    <nav
      v-if="socialLinks"
      class="grid mt-14 mb-9 container mx-auto px-4 gap-4"
    >
      <ul class="flex gap-3 flex-wrap">
        <li v-for="item of socialLinks.items" :key="item?.id">
          <NuxtLink
            :to="getItemUrl(item?.type, item?.path, item?.related?.__typename)"
            class="cursor-pointer"
          >
            <figure class="w-12 aspect-square">
              <img :src="item?.additionalFields?.icon!" />
              <figcaption class="hidden">
                {{ item?.title }}
              </figcaption>
            </figure>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </footer>
</template>
