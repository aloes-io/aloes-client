# build stage
FROM node:lts-alpine as build-stage

RUN mkdir -p /home/node/$NODE_NAME
WORKDIR /home/node/$NODE_NAME
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /home/node/$NODE_NAME/package.json
RUN npm install --silent
RUN npm install @vue/cli@3.7.0 -g
# COPY . /home/node/$NODE_NAME/.
COPY . /home/node/$NODE_NAME
RUN npm run build

# production stage 
FROM nginx:1.16-alpine as production-stage
COPY --from=build-stage /home/node/$NODE_NAME/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./config/nginx.conf /etc/nginx/conf.d
CMD ["nginx", "-g", "daemon off;"]

# USER node