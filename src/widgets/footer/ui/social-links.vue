<script setup lang="ts">
defineProps<{
    socialLinks: (NavigationItem | null)[] | null
}>()

const { getItemUrl } = useNavigationItemUrl();
</script>
<template>
<nav
    v-if="socialLinks && Array.isArray(socialLinks)"
>
    <ul class="flex gap-3 flex-wrap">
        <li v-for="item of socialLinks" :key="item?.id">
            <NuxtLink
                :to="
                    getItemUrl(
                        item?.type,
                        item?.path,
                        item?.related?.__typename,
                    )
                "
                class="cursor-pointer"
            >
                <figure class=" w-9 md:w-12 aspect-square">
                    <img
                        :src="item?.additionalFields?.icon!"
                        :alt="item?.title ?? ''"
                        width="48"
                        height="48"
                        loading="lazy"
                        decoding="async"
                        class="size-full object-contain"
                    />
                    <figcaption class="hidden">
                        {{ item?.title }}
                    </figcaption>
                </figure>
            </NuxtLink>
        </li>
    </ul>
</nav>
</template>
