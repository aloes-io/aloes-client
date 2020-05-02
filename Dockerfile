FROM node:12-slim
LABEL maintainer="getlarge <ed@getlarge.eu>"

ENV BUILD=dist
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

CMD ["/bin/bash", "-c", "envsub -e VUE_APP_SERVER_URL=$VUE_APP_SERVER_URL -e VUE_APP_BROKER_URL=$VUE_APP_BROKER_URL  \ 
  -e VUE_APP_ROOT_API=$VUE_APP_ROOT_API -e VUE_APP_CLIENT_URL=$VUE_APP_CLIENT_URL -e VUE_APP_LOGGER_LEVEL=$VUE_APP_LOGGER_LEVEL \
  -e VUE_APP_DOMAIN=$VUE_APP_DOMAIN ./$BUILD/env.template.js ./$BUILD/env.js && \
  envsub --diff ./$BUILD/env.template.js ./$BUILD/env.js && \
  light-server -s ./$BUILD -p $PORT --no-reload --historyindex '/index.html' -q"]
