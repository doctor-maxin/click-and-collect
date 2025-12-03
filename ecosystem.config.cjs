module.exports = {
  apps: [
    {
      name: "sin-storefront",
      script: ".output/server/index.mjs",
      interpreter: "bun",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
