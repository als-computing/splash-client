# https://vuejs.org/v2/cookbook/dockerize-vuejs-app.html

# build stage
FROM node:lts-alpine as build-stage
ENV VUE_APP_SPLASH_BASE=splash
WORKDIR /app
COPY package*.json ./
RUN npm update
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
ENV VUE_APP_SPLASH_BASE=splash
COPY --from=build-stage /app/dist /usr/share/nginx/html/${VUE_APP_SPLASH_BASE}
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]