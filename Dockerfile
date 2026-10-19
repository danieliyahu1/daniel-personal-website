FROM nginx:stable-alpine

COPY index.html he.html he-daftari.html 404.html connect.html work.html apps.html daftari.html sitemap.xml robots.txt /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets

EXPOSE 80
