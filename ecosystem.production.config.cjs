module.exports = {
  apps: [
    {
      name: "sin-storefront-prod",
      script: "npm",
      args: "run start",
      interpreter: "bun",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      max_memory_restart: "2G",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
      autorestart: true,
      watch: false,
    },
  ],
};
