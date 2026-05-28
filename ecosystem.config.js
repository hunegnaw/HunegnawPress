/**
 * PM2 Ecosystem Configuration
 * HunegnawPress — Reusable CMS
 *
 * This config is used by the deploy script. APP_NAME and APP_PORT
 * are passed as environment variables during deployment.
 *
 * The PM2 process name will be: {APP_NAME}-{ENVIRONMENT}
 * e.g., "cherryoakracing-production" or "thesnotty-production"
 */

const APP_NAME = process.env.APP_NAME || "hunegnawpress";
const APP_PORT = parseInt(process.env.APP_PORT || "3000", 10);
const ENVIRONMENT = process.env.ENVIRONMENT || "production";

module.exports = {
  apps: [
    {
      name: `${APP_NAME}-${ENVIRONMENT}`,
      script: "npm",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: APP_PORT,
      },
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      kill_timeout: 5000,
    },
  ],
};
