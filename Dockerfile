# Establish Node Environment Version

FROM node:17.2.0

# Create app directory
WORKDIR /usr/src/todoApi


# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./


RUN npm install


# Bundle app source 
COPY /src/todoApi /usr/src/todoApi

# Expose App Port
EXPOSE 8080

# Initate App
CMD [ "node", "app.js" ]

