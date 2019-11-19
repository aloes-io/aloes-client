# Copyright 2019 Edouard Maleix, read LICENSE

# build stage
FROM node:lts-alpine as build-stage

WORKDIR /app

ENV VUE_APP_NAME=ALOES
ENV BASE_URL=/
ENV VUE_APP_DOMAIN=localhost
ENV VUE_APP_SERVER_URL=http://localhost:8000
ENV VUE_APP_BROKER_URL=ws://locahost:8080
ENV VUE_APP_CLIENT_URL=http://localhost:8080
ENV VUE_APP_ROOT_API=/api
ENV VUE_APP_LOGGER_LEVEL=4

ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package*.json /app

# COPY . /app/.
COPY vue.config.js /app/
COPY src /app/src
COPY public /app/public
COPY .env /app/

RUN npm install
RUN npm install -g @vue/cli

# start app
CMD ["npm", "run", "start"]
