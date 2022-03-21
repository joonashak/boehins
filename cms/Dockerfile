FROM node:16.14

WORKDIR /usr/src/app
COPY . .
RUN npm ci

CMD npm run start:dev -- --preserveWatchOutput
