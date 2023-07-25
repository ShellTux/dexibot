FROM node:20-alpine

WORKDIR /app

COPY . .

RUN apk update
RUN apk add --no-cache --virtual .gyp g++ make py3-pip
RUN npm clean-install
RUN apk del .gyp
RUN apk add ffmpeg youtube-dl yt-dlp
RUN npm run build

USER node

CMD ["npm", "run", "start"]
