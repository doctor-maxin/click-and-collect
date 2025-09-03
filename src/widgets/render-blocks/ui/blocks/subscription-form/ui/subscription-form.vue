<script setup lang="ts">
import { FeatureRenderMedia } from "~/features/render-media";
import type { ISubscriptionBlock } from "~/widgets/render-blocks";

defineProps<{
    data: ISubscriptionBlock;
}>();
</script>
<template>
    <section class="relative h-screen">
        <FeatureRenderMedia
            :media="data.bg"
            :mobile-media="data.mobileBg"
            class="h-full !absolute"
        />
        <div
            class="container relative z-10 mx-auto flex h-full items-end justify-start"
        >
            <form class="max-w-[41rem] flex-col bottom-0 text-white py-12 flex">
                <h3 class="mb-7 uppercase text-[2rem] font-semibold leading-10">
                    {{ data.header }}
                </h3>
                <p class="text-[1.5rem] font-medium leading-8 mb-12">
                    {{ data.text }}
                </p>
                <div
                    class="flex mb-9 gap-[4.25rem] justify-between items-center"
                >
                    <UiInput
                        placeholder="E-mail"
                        type="email"
                        variant="outline"
                        class="w-full"
                    />
                    <UiButton class="w-[16.25rem]" variant="secondary"
                        >Подписаться</UiButton
                    >
                </div>
                <UiCheckbox name="accept"
                    >Даю
                    <NuxtLink to="/pages/privacy-policy" class="underline"
                        >согласие на обработку персональных данных</NuxtLink
                    ></UiCheckbox
                >
            </form>
        </div>
    </section>
</template>
