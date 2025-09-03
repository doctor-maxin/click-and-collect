import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["nuxt-svgo", "nuxt-swiper", "@nuxt/image"],
  alias: {
    "@": "../src",
    "@assets": "../src/app/assets",
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
  runtimeConfig: {
    public: {
      strapiUrl: process.env.STRAPI_URL,
      strapiToken: process.env.STRAPI_TOKEN,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
