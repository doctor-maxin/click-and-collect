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

const appConfig = useAppConfig();
const { data: product_categories } =
  useNuxtData<StoreProductCategory[]>("categories");
const { data: availableCategories } = useNuxtData<string[]>(
  "available-categories",
);
const categoriesTree = computed(() => {
  const deparments =
    product_categories.value?.find((c) => c.handle === appConfig.brand)
      ?.category_children || [];

  return deparments.map((deparment) => {
    const category_children = [];
    for (const classChild of deparment.category_children) {
      category_children.push(...classChild.category_children);
    }
    return {
      ...deparment,
      category_children: [],
    };
  });
});

console.log("categoriesTree", categoriesTree.value);

function clearedCategories(list: StoreProductCategory[]) {
  return list.filter((c) => availableCategories.value?.includes(c.id));
}

defineProps<{
  menu: NavigationMenu;
}>();
defineEmits<{
  (e: "close"): void;
}>();
</script>

<template>
  <NavigationMenuRoot orientation="vertical" class="flex w-full">
    <NavigationMenuList class="flex flex-col min-w-[9rem]">
      <NavigationMenuItem
        v-for="category of clearedCategories(categoriesTree)"
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
          <NuxtLink :to="'/catalog/' + category.handle" @click="$emit('close')">
            {{ category.name }} s
          </NuxtLink>
        </NavigationMenuLink>
        <NavigationMenuContent
          v-if="category.category_children?.length"
          class="pl-[6rem] navigation-menu-content"
        >
          <NavigationMenuSub>
            <NavigationMenuList class="flex flex-col min-w-[9rem]">
              <NavigationMenuItem
                v-for="subCategory of clearedCategories(
                  category.category_children,
                )"
                :value="subCategory.handle"
                :key="subCategory.id"
                class="uppercase py-2 items-center gap-4 font-medium text-xl leading-5 flex justify-between w-full"
              >
                <NavigationMenuLink>
                  <NuxtLink
                    :to="`/catalog/${subCategory.handle}`"
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
                color: item.additionalFields?.color ?? 'inherit',
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
                      color: item.additionalFields?.color ?? 'inherit',
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
        <span class="text-2xl"><SvgoArrowRight filled class="!mb-0" /></span>
      </NavigationMenuIndicator>
    </NavigationMenuList>

    <div class="perspective-[2000px]">
      <NavigationMenuViewport align="start" class="navigation-menu-viewport" />
    </div>
  </NavigationMenuRoot>
</template>

<style></style>
