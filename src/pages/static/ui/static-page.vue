<script setup lang="ts">
import { PublicationStatus } from "#gql/default";
import { StrapiBlocks, type BlocksContent } from "vue-strapi-blocks-renderer";

const route = useRoute();

if (!route.params.handle || route.params.handle === "undefined")
  throw createError({
    message: "Страница не найдена",
    statusCode: 404,
    fatal: true,
    data: route.params,
  });

const { data: page, error } = await useAsyncData(
  () => route.params.handle as string,
  () =>
    GqlGetStaticPage({
      status: PublicationStatus.PUBLISHED,
      filters: {
        handle: {
          eq: route.params.handle as string,
        },
      },
    }),
  {
    transform: (r) => r?.pages?.[0],
  },
);

if (!page.value)
  throw createError({
    message: "Страница не найдена",
    statusCode: 404,
    fatal: true,
    data: route.params,
  });
</script>
<template>
  <div v-if="page" class="mt-16 lg:mt-[8.125rem]">
    <div class="container mx-auto px-4 lg:px-0">
      <h1 class="my-9 text-center font-semibold text-[1.25rem] leading-6">
        {{ page.title }}
      </h1>
      <div class="content max-w-[37rem] ml-auto">
        <StrapiBlocks :content="page?.preamble as BlocksContent" />
      </div>
      <div class="content">
        <StrapiBlocks :content="page?.content as BlocksContent" />
      </div>
    </div>
  </div>
</template>
