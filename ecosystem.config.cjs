module.exports = {
  apps: [
    {
      name: "sin-storefront",
      script: ".output/server/index.mjs",
      interpreter: "bun",
      cwd: "/server/storefront",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
