// app/router.options.ts
import type { RouterConfig } from "@nuxt/schema";
import { useNuxtApp } from "#app";

// https://router.vuejs.org/api/#routeroptions
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // Anchor scrolling is handled after the page content is rendered.
    if (to.hash) return false;

    // Query changes are used by filters, pagination and autoload.
    if (to.path === from.path) return false;

    const nuxtApp = useNuxtApp();

    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce("page:loading:end", () => {
        requestAnimationFrame(() => {
          resolve(savedPosition ?? { left: 0, top: 0 });
        });
      });
    });
  },
};
