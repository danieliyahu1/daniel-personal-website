FROM nginx:stable-alpine

COPY index.html 404.html connect.html journeys.html now.html work.html /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets

EXPOSE 80