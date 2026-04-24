<script setup lang="ts">
import {
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuRoot,
    NavigationMenuSub,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from "reka-ui";
import type { StoreProductCategory } from "@medusajs/types";

const { data: product_categories } =
    useNuxtData<StoreProductCategory[]>("categories");
const { data: availableCategories } = useNuxtData<string[]>(
    "available-categories",
);

const filterAvailableCategories = (
    categories: StoreProductCategory[],
): StoreProductCategory[] => {
    return categories
        .filter((category) => availableCategories.value?.includes(category.id))
        .map((category) => ({
            ...category,
            category_children: filterAvailableCategories(
                category.category_children ?? [],
            ),
        }));
};

const categoriesTree = computed(() => {
    const menuCategories =
        product_categories.value?.find((c) => c.handle === "menu")
            ?.category_children ?? [];

    return filterAvailableCategories(menuCategories);
});

const props = defineProps<{
    menu: NavigationMenu;
}>();
const emit = defineEmits<{
    (e: "close"): void;
}>();

type MobileMenuItem = {
    id: string;
    title: string;
    path: string;
    color?: string;
    children: {
        id: string;
        title: string;
        path: string;
    }[];
};

const mobileMenuItems = computed<MobileMenuItem[]>(() => {
    const categoryItems: MobileMenuItem[] = categoriesTree.value.map(
        (category) => ({
            id: `category-${category.id}`,
            title: category.name,
            path: `/catalog/${category.handle}`,
            children:
                category.category_children?.map((subCategory) => ({
                    id: `subcategory-${subCategory.id}`,
                    title: subCategory.name,
                    path: `/catalog/${subCategory.handle}`,
                })) ?? [],
        }),
    );

    const navigationItems: MobileMenuItem[] = props.menu.map((item) => ({
        id: `menu-${item.uiRouterKey}`,
        title: item.title,
        path: item.path,
        color: item.additionalFields?.color,
        children:
            item.items?.map((subItem) => ({
                id: `submenu-${subItem.slug}`,
                title: subItem.title,
                path: subItem.path,
            })) ?? [],
    }));

    return [...categoryItems, ...navigationItems];
});

const activeMobileItemId = ref<string | null>(null);
const activeMobileItem = computed(() =>
    mobileMenuItems.value.find((item) => item.id === activeMobileItemId.value),
);
const activeTabletItemId = ref<string | null>(null);
const activeTabletItem = computed(() =>
    mobileMenuItems.value.find((item) => item.id === activeTabletItemId.value),
);

const openMobileSubmenu = (itemId: string) => {
    activeMobileItemId.value = itemId;
};

const closeMobileSubmenu = () => {
    activeMobileItemId.value = null;
};

const closeMenu = () => {
    activeMobileItemId.value = null;
    activeTabletItemId.value = null;
    emit("close");
};

const toggleTabletSubmenu = (itemId: string) => {
    activeTabletItemId.value =
        activeTabletItemId.value === itemId ? null : itemId;
};

const toSentenceCase = (value: string) => {
    if (!value) return "";
    const normalizedValue = value.toLowerCase();
    return normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1);
};
</script>

<template>
    <div class="sm:hidden w-full overflow-x-hidden overflow-y-auto">
        <div
            class="flex w-[200%] transition-transform duration-300 ease-out"
            :class="activeMobileItem ? '-translate-x-1/2' : 'translate-x-0'"
        >
            <div class="w-1/2 shrink-0">
                <ul class="flex flex-col min-w-[9rem]">
                    <li
                        v-for="item of mobileMenuItems"
                        :key="item.id"
                        class="py-2 text-xl leading-5"
                    >
                        <button
                            v-if="item.children.length"
                            type="button"
                            class="uppercase w-full cursor-pointer font-semibold text-left flex items-center justify-between gap-4"
                            :style="{ color: item.color ?? 'inherit' }"
                            @click="openMobileSubmenu(item.id)"
                        >
                            <span>{{ item.title }}</span>
                            <SvgoArrowRight
                                filled
                                class="text-xl !mb-0 shrink-0"
                            />
                        </button>
                        <NuxtLink
                            v-else
                            :to="item.path"
                            class="uppercase w-full block cursor-pointer font-semibold"
                            :style="{ color: item.color ?? 'inherit' }"
                            @click="closeMenu"
                        >
                            {{ item.title }}
                        </NuxtLink>
                    </li>
                </ul>
            </div>

            <div class="w-1/2 shrink-0">
                <ul v-if="activeMobileItem" class="flex flex-col min-w-[9rem]">
                    <li class="py-2 text-xl leading-5">
                        <NuxtLink
                            :to="activeMobileItem.path"
                            class="w-full block font-medium"
                            :style="{
                                color: activeMobileItem.color ?? 'inherit',
                            }"
                            @click="closeMenu"
                        >
                            Смотреть {{ activeMobileItem.title.toLowerCase() }}
                        </NuxtLink>
                    </li>
                    <li
                        v-for="childItem of activeMobileItem.children"
                        :key="childItem.id"
                        class="py-2 text-xl leading-5"
                    >
                        <NuxtLink
                            :to="childItem.path"
                            class="w-full block font-medium"
                            @click="closeMenu"
                        >
                            {{ toSentenceCase(childItem.title) }}
                        </NuxtLink>
                    </li>

                    <li class="py-2 text-xl leading-5">
                        <button
                            type="button"
                            class="w-full cursor-pointer font-medium flex items-center"
                            @click="closeMobileSubmenu"
                        >
                            <SvgoArrowRight
                                filled
                                class="text-xl !mb-0 rotate-180 shrink-0"
                            />
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="hidden sm:flex lg:hidden w-full gap-8 items-start">
        <ul class="flex flex-col w-56 shrink-0">
            <li
                v-for="item of mobileMenuItems"
                :key="item.id"
                class="py-2 text-xl leading-5"
            >
                <div class="flex items-start gap-3">
                    <NuxtLink
                        :to="item.path"
                        class="uppercase flex-1 block cursor-pointer font-semibold"
                        :style="{ color: item.color ?? 'inherit' }"
                        @click="closeMenu"
                    >
                        {{ item.title }}
                    </NuxtLink>
                    <button
                        v-if="item.children.length"
                        type="button"
                        class="cursor-pointer shrink-0"
                        :aria-expanded="activeTabletItemId === item.id"
                        @click="toggleTabletSubmenu(item.id)"
                    >
                        <SvgoArrowRight filled class="text-xl !mb-0" />
                    </button>
                </div>
            </li>
        </ul>

        <ul
            v-if="activeTabletItem?.children?.length"
            class="flex flex-col min-w-36"
        >
            <li class="py-2 text-xl leading-5">
                <NuxtLink
                    :to="activeTabletItem.path"
                    class="w-full block font-medium"
                    :style="{ color: activeTabletItem.color ?? 'inherit' }"
                    @click="closeMenu"
                >
                    Смотреть {{ activeTabletItem.title.toLowerCase() }}
                </NuxtLink>
            </li>
            <li
                v-for="childItem of activeTabletItem.children"
                :key="childItem.id"
                class="py-2 text-xl leading-5"
            >
                <NuxtLink
                    :to="childItem.path"
                    class="w-full block font-medium"
                    @click="closeMenu"
                >
                    {{ toSentenceCase(childItem.title) }}
                </NuxtLink>
            </li>
        </ul>
    </div>

    <NavigationMenuRoot orientation="vertical" class="hidden lg:flex w-full">
        <NavigationMenuList class="flex flex-col min-w-[9rem]">
            <NavigationMenuItem
                v-for="category of categoriesTree"
                :key="category.id"
                class="group"
            >
                <NavigationMenuTrigger
                    v-if="category.category_children?.length"
                    class="uppercase main-menu-bar-link relative py-2 text-left font-semibold text-xl leading-5 w-full"
                >
                    <NavigationMenuLink as-child>
                        <NuxtLink
                            :to="'/catalog/' + category.handle"
                            class="w-full block"
                            @click="$emit('close')"
                        >
                            {{ category.name }}
                        </NuxtLink>
                    </NavigationMenuLink>
                </NavigationMenuTrigger>
                <NavigationMenuLink
                    as-child
                    v-else
                    class="uppercase block text-left py-2 gap-4 font-semibold text-xl leading-5 w-full"
                >
                    <NuxtLink
                        :to="'/catalog/' + category.handle"
                        @click="$emit('close')"
                    >
                        {{ category.name }}
                    </NuxtLink>
                </NavigationMenuLink>
                <NavigationMenuContent
                    v-if="category.category_children?.length"
                    class="pl-[6rem] navigation-menu-content"
                >
                    <NavigationMenuSub>
                        <NavigationMenuList class="flex flex-col min-w-[15rem]">
                            <NavigationMenuItem
                                v-for="subCategory of category.category_children"
                                :value="subCategory.handle"
                                :key="subCategory.id"
                                class="uppercase py-2 items-center gap-4 font-medium text-xl leading-5 flex justify-between w-full"
                            >
                                <NavigationMenuLink>
                                    <NuxtLink
                                        :to="'/catalog/' + subCategory.handle"
                                        @click="$emit('close')"
                                    >
                                        {{ subCategory.name }}
                                    </NuxtLink>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenuSub>
                    <NavigationMenuLink />
                </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem
                v-for="item of menu"
                :key="item.uiRouterKey"
                class="group"
            >
                <NavigationMenuTrigger
                    v-if="item.type === 'WRAPPER' && item.items?.length"
                    class="uppercase py-2 text-left font-semibold text-xl leading-5 w-full"
                >
                    <NavigationMenuLink as-child>
                        <NuxtLink
                            :to="item.path"
                            :style="{
                                color:
                                    item.additionalFields?.color ?? 'inherit',
                            }"
                            class="w-full block"
                            @click="$emit('close')"
                        >
                            {{ item.title }}
                        </NuxtLink>
                    </NavigationMenuLink>
                </NavigationMenuTrigger>
                <NavigationMenuLink
                    as-child
                    v-else
                    class="uppercase block text-left py-2 gap-4 font-semibold text-xl leading-5 w-full"
                >
                    <NuxtLink
                        :to="item.path"
                        :style="{
                            color: item.additionalFields?.color ?? 'inherit',
                        }"
                        @click="$emit('close')"
                    >
                        {{ item.title }}
                    </NuxtLink>
                </NavigationMenuLink>
                <NavigationMenuContent
                    v-if="item.items?.length"
                    class="pl-[6rem] navigation-menu-content"
                >
                    <NavigationMenuSub>
                        <NavigationMenuList class="flex flex-col min-w-[9rem]">
                            <NavigationMenuItem
                                v-for="subItem of item.items"
                                :value="subItem.slug"
                                :key="item.uiRouterKey"
                                class="uppercase py-2 items-center gap-4 font-medium text-xl leading-5 flex justify-between w-full"
                            >
                                <NavigationMenuLink>
                                    <NuxtLink
                                        :to="subItem.path"
                                        :style="{
                                            color:
                                                item.additionalFields?.color ??
                                                'inherit',
                                        }"
                                        @click="$emit('close')"
                                    >
                                        {{ subItem.title }}
                                    </NuxtLink>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenuSub>
                    <NavigationMenuLink />
                </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuIndicator
                class="absolute pointer-events-none top-0 py-1.5 left-full pl-3 translate-y-[var(--reka-navigation-menu-indicator-position)]"
                data-orientation="vertical"
            >
                <span class="text-2xl"
                    ><SvgoArrowRight filled class="!mb-0"
                /></span>
            </NavigationMenuIndicator>
        </NavigationMenuList>

        <div class="perspective-[2000px]">
            <NavigationMenuViewport
                align="start"
                class="navigation-menu-viewport"
            />
        </div>
    </NavigationMenuRoot>
</template>

<style></style>
