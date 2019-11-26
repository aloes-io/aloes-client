# Copyright 2019 Edouard Maleix, read LICENSE

# build stage
FROM node:lts-alpine as build-stage

RUN mkdir -p /home/node/aloes-client
WORKDIR /home/node/aloes-client

ENV PATH=/home/node/aloes-client/node_modules/.bin:$PATH

COPY package*.json /home/node/aloes-client/
COPY vue.config.js /home/node/aloes-client/
COPY src /home/node/aloes-client/src
COPY public /home/node/aloes-client/public

ARG VUE_APP_NAME=ALOES
ARG VUE_APP_DOMAIN=localhost
ARG VUE_APP_SERVER_URL=http://localhost:8000
ARG VUE_APP_BROKER_URL=ws://localhost:3000
ARG VUE_APP_ROOT_API=/api
ARG VUE_APP_CLIENT_URL=http://localhost:8080
ARG VUE_APP_LOGGER_LEVEL=4
ARG GIT_REPO_SSH_URL=https://framagit.org/aloes/aloes-client

ENV VUE_APP_NAME=$VUE_APP_NAME
ENV VUE_APP_DOMAIN=$VUE_APP_DOMAIN
ENV VUE_APP_SERVER_URL=$VUE_APP_SERVER_URL
ENV VUE_APP_BROKER_URL=$VUE_APP_BROKER_URL
ENV VUE_APP_ROOT_API=$VUE_APP_ROOT_API
ENV VUE_APP_CLIENT_URL=$VUE_APP_CLIENT_URL
ENV VUE_APP_LOGGER_LEVEL=$VUE_APP_LOGGER_LEVEL
ENV GIT_REPO_SSH_URL=$GIT_REPO_SSH_URL

RUN npm install -g @vue/cli

RUN yarn install
RUN yarn build

