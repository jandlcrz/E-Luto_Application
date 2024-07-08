FROM node:20.15-alpine3.19 AS development

ARG REACT_APP_BASE_URL=http://localhost:5000

ENV REACT_APP_BASE_URL=${REACT_APP_BASE_URL}

WORKDIR /app

COPY package*.json .

RUN npm install

RUN npm install -g nodemon

COPY . .

EXPOSE 3000

CMD ["nodemon", "--exec", "npm", "run", "start"]



FROM node:20.15-alpine3.19 AS builder

ARG REACT_APP_BASE_URL=http://localhost:5000

ENV REACT_APP_BASE_URL=${REACT_APP_BASE_URL}

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine3.19 AS production

COPY --from=builder /app/build /usr/share/nginx/html

RUN rm -rf /etc/nginx/conf.d/*

COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]