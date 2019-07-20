# build stage
FROM node:lts-alpine as build-stage

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
COPY . /app/.

RUN npm install
RUN npm run build

# production stage 
FROM nginx:1.16-alpine as production-stage
COPY --from=build-stage /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
