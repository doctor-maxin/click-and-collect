<script setup lang="ts">
const client = useStrapiClient();

const { data: config } = useNuxtData("config");
const { data: footerMenu } = await useAsyncData(
    "footer-menu",
    () =>
        client
            .single("navigation/render/footer-menu?type=TREE")
            .find() as unknown as Promise<NavigationMenu>,
);
</script>
<template>
    <footer class="pb-8 pt-14">
        <div class="container mx-auto grid additionalFields grid-cols-12">
            <section
                v-for="menu of footerMenu"
                :key="menu.id"
                class="col-span-2"
            >
                <span class="text-base block mb-5 font-semibold leading-5">{{
                    menu.title
                }}</span>
                <nav>
                    <ul
                        v-if="menu.additionalFields.isSocialMenu"
                        class="flex gap-3 flex-wrap"
                    >
                        <li v-for="item of menu.items" :key="item.id">
                            <NuxtLink :to="item.path" class="cursor-pointer">
                                <figure class="w-12 aspect-square">
                                    <img :src="item.additionalFields.icon" />
                                    <figcaption class="hidden">
                                        {{ item.title }}
                                    </figcaption>
                                </figure>
                            </NuxtLink>
                        </li>
                    </ul>
                    <ul v-else class="flex flex-col gap-3">
                        <li v-for="item of menu.items" :key="item.id">
                            <NuxtLink
                                class="text-base cursor-pointer leading-5"
                                :to="item.url"
                                >{{ item.title }}</NuxtLink
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
    </footer>
</template>
