FROM node:10-slim

LABEL maintainer="getlarge <ed@getlarge.eu>"

RUN apt-get update && apt-get install gettext -y

ENV VUE_APP_NAME=Aloes
ENV PORT=8080
ENV VUE_APP_DOMAIN=localhost
ENV VUE_APP_SERVER_URL=http://localhost:8000
ENV VUE_APP_BROKER_URL=ws://localhost:3000
ENV VUE_APP_ROOT_API=/api
ENV VUE_APP_CLIENT_URL=http://localhost:8080
ENV VUE_APP_LOGGER_LEVEL=4
ENV GIT_REPO_SSH_URL=https://framagit.org/aloes/aloes-client
ENV PATH=/home/node/$VUE_APP_NAME/node_modules/.bin:$PATH

USER node

RUN mkdir -p /home/node/$VUE_APP_NAME
WORKDIR /home/node/$VUE_APP_NAME

COPY --chown=node package*.json ./
COPY --chown=node vue.config.js ./
COPY --chown=node src ./src
COPY --chown=node public ./public

RUN npm install && npm run build
RUN npm install light-server

# EXPOSE ${PORT}

CMD ["/bin/bash", "-c", "cat ./dist/env.template.js | \
  envsubst '$$VUE_APP_SERVER_URL $$VUE_APP_BROKER_URL $$VUE_APP_ROOT_API $$VUE_APP_DOMAIN $$VUE_APP_CLIENT_URL' > ./dist/env.js && \
  light-server -s ./dist -p $PORT --no-reload --historyindex '/index.html' -q"]
