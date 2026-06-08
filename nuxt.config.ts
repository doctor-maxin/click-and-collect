import tailwindcss from "@tailwindcss/vite";

const IGNORED_BUILD_WARNINGS = [
    "Sourcemap is likely to be incorrect",
    "The 'this' keyword is equivalent to 'undefined' at the top level of an ES module",
];

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    routeRules: {
        "/search": { robots: false },
    },
    modules: [
        "nuxt-svgo",
        "nuxt-swiper",
        "vue-yandex-maps/nuxt",
        "@nuxt/image",
        "nuxt-graphql-client",
        "@pinia/nuxt",
        "pinia-plugin-persistedstate/nuxt",
        "@nuxtjs/seo",
        "@vueuse/nuxt",
    ],
    $production: {
        routeRules: {
            // "/": { swr: 5 },
            // "/product/**": { swr: 5 },
            // "/catalog/**": { swr: 5 },
            // "/pages/**": { swr: 300 },
        },
    },
    site: {
        url: process.env.NUXT_SITE_URL,
        name: process.env.NUXT_SITE_NAME,
        description: process.env.NUXT_SITE_DESCRIPTION,
        defaultLocale: process.env.NUXT_DEFAULT_LOCALE,
    },
    sitemap: {
        sources: ["/api/__sitemap__/urls"],
        exclude: ["/search"],
    },
    robots: {
        blockNonSeoBots: true,
        cacheControl: "max-age=14400, must-revalidate",
        sitemap: ["/sitemap.xml"],
    },
    schemaOrg: {
        identity: {
            type: "Organization",
            name: process.env.NUXT_SITE_NAME!,
            logo: "/apple-touch-icon.png",
        },
    },
    yandexMaps: {
        apikey: process.env.NUXT_YANDEX_API_KEY,
    },
    rootDir: ".",
    srcDir: "src",
    css: ["~/app/assets/styles/main.css"],
    ssr: true,
    image: {
        format: ["webp", "avif"],
        strapi: {
            baseURL: `${process.env.STRAPI_URL}`,
        },
        providers: {
            customS3: {
                provider: "~/providers/customS3.ts",
            },
        },
    },
    components: {
        dirs: [
            {
                path: "shared/ui",
                prefix: "ui",
            },
        ],
    },
    imports: {
        dirs: ["shared/lib"],
    },
    app: {
        head: {
            // update Nuxt defaults
            charset: "utf-16",
            viewport: "width=device-width, initial-scale=1, maximum-scale=1",
            htmlAttrs: {
                lang: "ru",
            },
            script: [
                {
                    innerHTML: `
                    (function(m,e,t,r,i,k,a){
                        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                        m[i].l=1*new Date();
                        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=109560870', 'ym');

                    ym(109560870, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`,
                },
            ],
            noscript: [
                {
                    innerHTML: `<div><img src="https://mc.yandex.ru/watch/109560870" style="position:absolute; left:-9999px;" alt="" /></div>`,
                },
            ],
        },
    },
    dir: {
        app: "app",
        pages: "app/routes",
        assets: "app/assets",
        layouts: "app/layouts",
    },
    svgo: {
        autoImportPath: "app/assets/icons",
        global: false,
    },
    sourcemap: {
        client: true,
        server: true,
    },
    "graphql-client": {
        watch: true,
        autoImport: true,
        functionPrefix: "Gql",
        documentPaths: [
            process.env.NODE_ENV === "production"
                ? "app/queries"
                : "src/app/queries",
        ],
        preferGETQueries: false,
        clients: {
            default: {
                host: process.env.STRAPI_URL + "/graphql",
                codegenHeaders: {
                    Authorization: "Bearer " + process.env.STRAPI_TOKEN,
                },
                retainToken: true,
                token: {
                    type: "Bearer",
                    name: "Authorization",
                    value: process.env.STRAPI_TOKEN,
                },
            },
        },
    },
    runtimeConfig: {
        public: {
            siteUrl: process.env.NUXT_SITE_URL,
            siteName: process.env.NUXT_SITE_NAME,
            strapiUrl: process.env.STRAPI_URL,
            strapiToken: process.env.STRAPI_TOKEN,
            medusaUrl: process.env.NUXT_MEDUSA_URL,
            medusaToken: process.env.NUXT_MEDUSA_TOKEN,
            searchApiKey: process.env.NUXT_SEARCH_API_KEY,
            searchUrl: process.env.NUXT_SEARCH_URL,
            cdnDomain: process.env.NUXT_PUBLIC_CDN_DOMAIN,
        },
    },
    router: {
        options: {
            scrollBehaviorType: "smooth",
        },
    },
    vite: {
        plugins: [tailwindcss()],
        build: {
            chunkSizeWarningLimit: 650,
            rollupOptions: {
                onwarn(warning, defaultHandler) {
                    const message =
                        typeof warning === "string"
                            ? warning
                            : (warning.message ?? "");
                    const code =
                        typeof warning === "string" ? undefined : warning.code;

                    if (
                        code === "CHUNK_SIZE_LIMIT" ||
                        IGNORED_BUILD_WARNINGS.some((item) =>
                            message.includes(item),
                        )
                    ) {
                        return;
                    }

                    defaultHandler(warning);
                },
            },
        },
        server: {
            allowedHosts: true,
        },
    },
    nitro: {
        preset: "bun",
        prerender: {
            routes: ["/_ipx/_/not_found.png"],
        },
    },
});
