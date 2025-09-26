import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "nuxt-svgo",
    "nuxt-swiper",
    "vue-yandex-maps/nuxt",
    "@nuxt/image",
    "nuxt-graphql-client",
    "@pinia/nuxt",
  ],
  alias: {
    "@": "../src",
    "@assets": "../src/app/assets",
  },
  yandexMaps: {
    apikey: process.env.NUXT_YANDEX_API_KEY,
  },
  rootDir: ".",
  srcDir: "src",
  css: ["./src/app/assets/styles/main.css"],
  ssr: true,
  image: {
    format: ["webp", "avif"],
    strapi: {
      baseURL: `${process.env.STRAPI_URL}`,
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
  dir: {
    app: "app",
    pages: "app/routes",
    assets: "app/assets",
    layouts: "app/layouts",
  },
  svgo: {
    autoImportPath: "app/assets/icons",
  },
  "graphql-client": {
    watch: true,
    autoImport: true,
    functionPrefix: "Gql",
    documentPaths: ["src/app/queries"],
    preferGETQueries: false,
    clients: {
      default: {
        host: process.env.STRAPI_URL + "/graphql",
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
      strapiUrl: process.env.STRAPI_URL,
      strapiToken: process.env.STRAPI_TOKEN,
      medusaUrl: process.env.NUXT_MEDUSA_URL,
      medusaToken: process.env.NUXT_MEDUSA_TOKEN,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  nitro: {
    preset: "bun",
  },
});