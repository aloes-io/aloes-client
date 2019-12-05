FROM nginx:latest

COPY --from=aloes/aloes-client:0.5 /home/node/aloes-client/dist /etc/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
