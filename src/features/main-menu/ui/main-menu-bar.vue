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

defineProps<{
    menu: NavigationMenu;
}>();
</script>

<template>
    <NavigationMenuRoot orientation="vertical" class="flex w-full">
        <NavigationMenuList class="flex flex-col min-w-[9rem]">
            <NavigationMenuItem
                v-for="item of menu"
                :key="item.uiRouterKey"
                class="group"
            >
                <NavigationMenuTrigger
                    v-if="item.type === 'WRAPPER' && item.items?.length"
                    class="uppercase py-2 text-left font-semibold text-base leading-5 w-full"
                >
                    <NavigationMenuLink as-child>
                        <NuxtLink
                            :to="item.path"
                            :style="{
                                color:
                                    item.additionalFields?.color ?? 'inherit',
                            }"
                            class="w-full block"
                        >
                            {{ item.title }}
                        </NuxtLink>
                    </NavigationMenuLink>
                </NavigationMenuTrigger>
                <NavigationMenuLink
                    as-child
                    v-else
                    class="uppercase block text-left py-2 gap-4 font-semibold text-base leading-5 w-full"
                >
                    <NuxtLink
                        :to="item.path"
                        :style="{
                            color: item.additionalFields?.color ?? 'inherit',
                        }"
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
                                class="uppercase py-2 items-center gap-4 font-medium text-base leading-5 flex justify-between w-full"
                            >
                                <NavigationMenuLink>
                                    <NuxtLink
                                        :to="subItem.path"
                                        :style="{
                                            color:
                                                item.additionalFields?.color ??
                                                'inherit',
                                        }"
                                    >
                                        {{ item.title }}
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
            <NavigationMenuViewport class="navigation-menu-viewport" />
        </div>
    </NavigationMenuRoot>
</template>
