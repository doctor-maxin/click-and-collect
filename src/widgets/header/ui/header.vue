<script setup lang="ts">
import { FeatureMainMenu } from "~/features/main-menu";

const client = useStrapiClient();
await useAsyncData(
    "main-menu",
    () =>
        client
            .single("navigation/render/main-menu?type=TREE")
            .find() as unknown as Promise<NavigationMenu>,
    {
        transform: (r) => {
            console.log("r, r", r);
            return r;
        },
    },
);
</script>
<template>
    <div
        class="absolute left-0 top-0 z-30 bg-transparent w-full flex justify-center"
    >
        <div
            class="container py-5 items-center text-black grid grid-cols-[1.5rem_auto_1.5rem]"
        >
            <FeatureMainMenu />

            <SvgoLogo class="h-[5.625rem] mx-auto" :fontControlled="false" />
            <button type="button">
                <SvgoSearch filled class="text-2xl" />
            </button>
        </div>
    </div>
</template>
