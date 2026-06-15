export default defineNuxtPlugin((nuxtApp) => {
    let navigationId = 0;

    const scrollToRouteAnchor = async () => {
        const currentNavigationId = ++navigationId;
        const hash = nuxtApp.$router.currentRoute.value.hash;
        if (!hash) return;

        await nextTick();
        await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        await new Promise((resolve) => setTimeout(resolve, 100));

        let id = hash.slice(1);
        try {
            id = decodeURIComponent(id);
        } catch {
            // Keep the raw hash value when it contains invalid URL encoding.
        }

        for (let attempt = 0; attempt < 10; attempt += 1) {
            if (currentNavigationId !== navigationId) return;

            const target = document.getElementById(id);

            if (target) {
                window.scrollTo({
                    top: window.scrollY + target.getBoundingClientRect().top,
                    behavior: "smooth",
                });
                return;
            }

            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    };

    nuxtApp.hook("page:finish", scrollToRouteAnchor);
    nuxtApp.hook("app:mounted", scrollToRouteAnchor);
});
