FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install --no-optional

RUN apt-get update && \
  apt-get install -y awscli

COPY . .

RUN npm run build

EXPOSE 3006

CMD [ "npm", "start" ]
