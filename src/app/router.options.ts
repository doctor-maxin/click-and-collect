// app/router.options.ts
import type { RouterConfig } from "@nuxt/schema";

// https://router.vuejs.org/api/#routeroptions
export default <RouterConfig>{
  scrollBehavior: (to, from, savedPosition) => {
    const toPage = Array.isArray(to.query.page)
      ? to.query.page[0]
      : to.query.page;
    const fromPage = Array.isArray(from.query.page)
      ? from.query.page[0]
      : from.query.page;
    const toAppend = Array.isArray(to.query._append)
      ? to.query._append[0]
      : to.query._append;

    // Numbered pagination should bring user to top, "load more" should not.
    if (to.path === from.path && toPage !== fromPage) {
      if (toAppend === "1") return false;

      return {
        left: 0,
        top: 0,
        behavior: "smooth",
      };
    }

    // Keep scroll position for other query-only updates (e.g. filters/sort).
    if (to.path === from.path && to.hash === from.hash) {
      return false;
    }

    // Scroll to hash anchor.
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }

    // Restore browser back/forward position.
    if (savedPosition) {
      return savedPosition;
    }

    // New page navigation.
    return {
      left: 0,
      top: 0,
    };
  },
};
