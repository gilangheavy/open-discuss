# Use an official Node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy app source
COPY . .

# The app binds to port 5000, so we'll expose it
EXPOSE 5000

# Define the command to run the app
CMD [ "npm", "run", "start" ]
