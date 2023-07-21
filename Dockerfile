FROM node:20-alpine

WORKDIR /app

COPY . .

RUN apk update
RUN apk add --no-cache --virtual .gyp g++ make py3-pip youtube-dl
RUN npm clean-install
RUN apk del .gyp
RUN npm run build

USER node

CMD ["npm", "run", "start"]
