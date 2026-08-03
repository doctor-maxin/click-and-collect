<script setup lang="ts">
import { NavigationRenderType } from "#gql/default";
import { useNavigationItemUrl } from "~/shared/lib/use-navigation-item-url";
import SocialLinks from "./social-links.vue";

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

const { getItemUrl } = useNavigationItemUrl();

const socialLinks = computed(() =>
    footerMenu.value?.find((item) => item?.additionalFields?.isSocialMenu),
);
const defaultLinks = computed(() =>
    footerMenu.value?.filter((item) => !item?.additionalFields?.isSocialMenu),
);
</script>
<template>
    <footer class="block pb-8 pt-14">
        <div
            class="container px-4 mx-auto grid grid-cols-1 additionalFields md:grid-cols-12 gap-5.5 md:gap-4"
        >
            <section
                v-for="(menu, index) of defaultLinks ?? []"
                :key="menu?.id"
                :class="{
                    'md:col-span-4': index === 1,
                    'md:col-span-2': index !== 1,
                }"
            >
                <span
                    class="text-base hidden md:block mb-5 font-semibold leading-5"
                    >{{ menu?.title }}</span
                >
                <nav>
                    <ul class="flex flex-col gap-3">
                        <li class="contents" v-for="item of menu?.items" :key="item?.id">
                            <NuxtLink
                                class="text-base cursor-pointer leading-5"
                                :class="{
'text-sm md:text-base': index !== 0
                                }"
                                :to="
                                    getItemUrl(
                                        item?.type,
                                        item?.path,
                                        item?.related?.__typename,
                                    )
                                "
                                >{{ item?.title }}</NuxtLink
                            >
                        </li>
                    </ul>
                </nav>
                <SocialLinks
                    class="grid md:hidden mt-6 mb-1 gap-3"
                    v-if="index === 0 && socialLinks?.items"
                    :socialLinks="socialLinks?.items"
                />
            </section>
            <section class="md:col-span-3 flex flex-col gap-7 md:col-start-10">
                <NuxtLink to="/" aria-label="На главную">
                    <SvgoLogo
                        aria-hidden="true"
                        :fontControlled="false"
                        class="w-24"
                    />
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

        <SocialLinks
            class="hidden md:grid mt-14 mb-9 container mx-auto px-4 gap-4"
            v-if="socialLinks?.items"
            :socialLinks="socialLinks?.items"
        />
    </footer>
</template>
