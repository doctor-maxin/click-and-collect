<script setup lang="ts">
import { NavigationRenderType } from "#gql/default";
import { useNavigationItemUrl } from "~/shared/lib/use-navigation-item-url";

defineEmits<{
    (e: "close"): void;
}>();

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

const { getItemUrl } = useNavigationItemUrl();

const socialLinks = computed(() =>
    footerMenu.value?.find((item) => item?.additionalFields?.isSocialMenu),
);
const defaultLinks = computed(() =>
    footerMenu.value?.filter((item) => !item?.additionalFields?.isSocialMenu),
);
const primaryLinks = computed(() => defaultLinks.value?.[0]?.items ?? []);
const secondaryLinks = computed(() => defaultLinks.value?.[1]?.items ?? []);
</script>
<template>
    <div class="mt-auto w-full flex flex-col gap-8">
        <div class="w-full mt-10 flex gap-9">
            <section v-if="primaryLinks.length">
                <nav>
                    <ul class="flex flex-col gap-3">
                        <li v-for="item of primaryLinks" :key="item?.id">
                            <NuxtLink
                                class="text-[1.25rem] cursor-pointer leading-6 font-medium"
                                :to="
                                    getItemUrl(
                                        item?.type,
                                        item?.path,
                                        item?.related?.__typename,
                                    )
                                "
                                @click="$emit('close')"
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
                            :to="
                                getItemUrl(
                                    item?.type,
                                    item?.path,
                                    item?.related?.__typename,
                                )
                            "
                            class="cursor-pointer"
                            @click="$emit('close')"
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
        <section v-if="secondaryLinks.length">
            <nav>
                <ul class="flex flex-col gap-2">
                    <li v-for="item of secondaryLinks" :key="item?.id">
                        <NuxtLink
                            class="text-sm cursor-pointer leading-5"
                            :to="
                                getItemUrl(
                                    item?.type,
                                    item?.path,
                                    item?.related?.__typename,
                                )
                            "
                            @click="$emit('close')"
                            >{{ item?.title }}</NuxtLink
                        >
                    </li>
                </ul>
            </nav>
        </section>
    </div>
</template>
