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
        APP_NAME: "aloes-client"
      },
      env_staging: {
        NODE_ENV: "staging",
        APP_NAME: "aloes-client"
      },
      env_production: {
        NODE_ENV: "production",
        APP_NAME: "aloes-client"
      }
    }
  ],
  deploy: {
    staging: {
      key: "~/.ssh/server5",
      user: "ed",
      host: ["server5.getlarge.eu"],
      ssh_options: ["Port=22", "StrictHostKeyChecking=yes"],
      ref: "origin/staging",
      repo: "git@framagit.org:yogiinmycity/aloes-client.git",
      path: "/home/ed/aloes-client",
      "pre-setup": "",
      "pre-deploy-local":
        "scp -P 22 deploy/.env_staging ed@server5.getlarge.eu:/home/ed/aloes-client/source/.env",
      "post-deploy": "npm install && npm run deploy && exit 0",
      env: {
        APP_NAME: "aloes-client"
      }
    },
    production: {
      key: "~/.ssh/server1-aloes",
      user: "aloes",
      host: ["server1.yogiinmycity.com"],
      ssh_options: ["Port=22", "StrictHostKeyChecking=yes"],
      ref: "origin/master",
      repo: "git@framagit.org:yogiinmycity/aloes-client.git",
      path: "/home/aloes/aloes-client",
      "pre-setup": "",
      "post-setup": "",
      "pre-deploy-local":
        "scp -P 22 deploy/.env_production aloes@server1.yogiinmycity.com:/home/aloes/aloes-client/source/.env",
      "post-deploy": "npm install && npm run deploy",
      env: {
        APP_NAME: "aloes-client"
      }
    }
  }
};
