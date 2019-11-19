/* Copyright 2019 Edouard Maleix, read LICENSE */

const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
  throw result.error;
}

module.exports = {
  apps: [
    {
      name: `${result.parsed.NODE_NAME}-${result.parsed.NODE_ENV}`,
      script: 'server.js',
      interpreter: 'node',
      max_memory_restart: '1G',
      restart_delay: 500,
      wait_ready: true,
      listen_timeout: 3000,
      env: {
        NODE_ENV: `${result.parsed.NODE_ENV}`,
        APP_NAME: 'aloes-client',
      },
      env_staging: {
        NODE_ENV: 'staging',
        APP_NAME: 'aloes-client',
      },
      env_production: {
        NODE_ENV: 'production',
        APP_NAME: 'aloes-client',
      },
    },
  ],
  deploy: {
    staging: {
      key: '~/.ssh/server5',
      user: `${result.parsed.VPS_USER}`,
      host: [result.parsed.VPS_HOST],
      ssh_options: ['Port=22', 'StrictHostKeyChecking=yes'],
      ref: `origin/staging`,
      repo: result.parsed.GIT_REPO_SSH_URL,
      path: `/home/${result.parsed.VPS_USER}/${result.parsed.NODE_NAME}-${result.parsed.NODE_ENV}`,
      'pre-setup': '',
      'pre-deploy-local': `scp -P 22 deploy/.env_${result.parsed.NODE_ENV} ${result.parsed.VPS_USER}@${result.parsed.VPS_HOST}:/home/${result.parsed.VPS_USER}/${result.parsed.NODE_NAME}/source/.env`,
      'post-deploy': 'npm install && npm run deploy:stage',
    },
    production: {
      key: '~/.ssh/server1-aloes',
      user: `${result.parsed.VPS_USER}`,
      host: [result.parsed.VPS_HOST],
      ssh_options: ['Port=22', 'StrictHostKeyChecking=yes'],
      ref: `origin/master`,
      repo: result.parsed.GIT_REPO_SSH_URL,
      path: `/home/${result.parsed.VPS_USER}/${result.parsed.NODE_NAME}-${result.parsed.NODE_ENV}`,
      'pre-setup': '',
      'pre-deploy-local': `scp -P 22 deploy/.env_${result.parsed.NODE_ENV} ${result.parsed.VPS_USER}@${result.parsed.VPS_HOST}:/home/${result.parsed.VPS_USER}/${result.parsed.NODE_NAME}-${result.parsed.NODE_ENV}/source/.env`,
      'post-deploy': 'npm install && npm run deploy && exit 0',
    },
  },
};
