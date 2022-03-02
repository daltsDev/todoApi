FROM node:17.2.0
WORKDIR /usr/src/todoApi
COPY package*.json ./
RUN npm install
COPY /src/todoApi /usr/src/todoApi
EXPOSE 8080
CMD [ "node", "app.js" ]

