FROM node:10.15.3
LABEL maintainer="getlarge <ed@getlarge.eu>"

# USER node

# ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
# ENV PATH=$PATH:/home/node/.npm-global/bin 
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

RUN mkdir -p /home/node/$VUE_APP_NAME
WORKDIR /home/node/$VUE_APP_NAME

COPY package*.json /home/node/$VUE_APP_NAME/
COPY vue.config.js /home/node/$VUE_APP_NAME/
COPY src /home/node/$VUE_APP_NAME/src
COPY public /home/node/$VUE_APP_NAME/public

RUN npm install && npm run build
RUN npm install -g light-server
RUN curl -L https://github.com/a8m/envsubst/releases/download/v1.1.0/envsubst-`uname -s`-`uname -m` -o envsubst
RUN chmod +x envsubst
RUN mv envsubst /usr/local/bin

# EXPOSE ${PORT}

CMD ["/bin/bash", "-c", "cat /home/node/$VUE_APP_NAME/dist/env.template.js | envsubst '$$VUE_APP_SERVER_URL $$VUE_APP_BROKER_URL $$VUE_APP_ROOT_API $$VUE_APP_DOMAIN $$VUE_APP_CLIENT_URL' > /home/node/$VUE_APP_NAME/dist/env.js && light-server -s /home/node/$VUE_APP_NAME/dist -p $PORT"]
