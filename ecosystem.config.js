const dotenv = require("dotenv");

const result = dotenv.config();
if (result.error) {
  throw result.error;
}
module.exports = {
  apps: [
    {
      name: "aloes-client",
      script: "cp deploy/.env_dev .env && vue-cli-service serve",
      interpreter: "node",
      max_memory_restart: "1G",
      restart_delay: 500,
      wait_ready: true,
      listen_timeout: 3000,
      env: {
        NODE_ENV: "development",
        APP_NAME: "aloes-client",
      },
      env_staging: {
        NODE_ENV: "staging",
        APP_NAME: "aloes-client",
      },
      env_production: {
        NODE_ENV: "production",
        APP_NAME: "aloes-client",
      },
    },
  ],
  deploy: {
    staging: {
      key: "~/.ssh/server5",
      user: `${result.parsed.VPS_STAGE_USER}`,
      host: [result.parsed.VPS_STAGE_HOST],
      ssh_options: ["Port=22", "StrictHostKeyChecking=yes"],
      ref: `origin/staging`,
      repo: result.parsed.GIT_REPO_SSH_URL,
      path: `/home/${result.parsed.VPS_STAGE_USER}/${result.parsed.NODE_NAME}`,
      "pre-setup": "",
      "pre-deploy-local": `scp -P 22 deploy/.env_staging ${result.parsed.VPS_STAGE_USER}@${
        result.parsed.VPS_STAGE_HOST
      }:/home/${result.parsed.VPS_STAGE_USER}/${result.parsed.NODE_NAME}/source/.env`,
      "post-deploy": "npm install && npm run deploy && exit 0",
    },
    production: {
      key: "~/.ssh/server1-aloes",
      user: `${result.parsed.VPS_PROD_USER}`,
      host: [result.parsed.VPS_PROD_HOST],
      ssh_options: ["Port=22", "StrictHostKeyChecking=yes"],
      ref: `origin/master`,
      repo: result.parsed.GIT_REPO_SSH_URL,
      path: `/home/${result.parsed.VPS_PROD_USER}/${result.parsed.NODE_NAME}`,
      "pre-setup": "",
      "pre-deploy-local": `scp -P 22 deploy/.env_production ${result.parsed.VPS_PROD_USER}@${
        result.parsed.VPS_PROD_HOST
      }:/home/${result.parsed.VPS_PROD_USER}/${result.parsed.NODE_NAME}/source/.env`,
      "post-deploy": "npm install && npm run deploy && exit 0",
    },
  },
};
