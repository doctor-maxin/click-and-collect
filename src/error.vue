<script setup lang="ts">
import { WidgetHeader } from "~/widgets/header";
import { WidgetFooter } from "~/widgets/footer";
import { WidgetScrollUp } from "~/widgets/scroll-up";
import { WidgetCookieBanner } from "~/widgets/cookie-banner";
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const errorName = computed(() => {
  return props.error.statusCode === 404
    ? "Возможно вы ошиблись, Такой страницы не существует"
    : props.error.message;
});
</script>
<template>
  <div class="flex flex-col min-h-screen w-full pb-12 lg:pb-0">
    <WidgetHeader class="static" />
    <div
      class="flex bg-[url(/error-page.jpg)] bg-cover bg-center flex-col text-white flex-1 justify-center items-center"
    >
      <div class="text-[8.25rem] text-center mb-9 font-semibold italic">
        {{ error.statusCode }}
      </div>
      <div class="font-medium mb-12 text-center text-2xl">{{ errorName }}</div>
      <UiButton variant="secondary" is-link to="/">Перейти на главную</UiButton>
    </div>
    <WidgetFooter />
    <WidgetScrollUp />
    <WidgetCookieBanner />
  </div>
</template>
