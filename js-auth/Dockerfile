# Dockerfile for the authentication server (app.js)
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you have a .npmrc file for private packages, uncomment the next line
# COPY .npmrc .

# Install dependencies for production.
RUN npm install --production

# Bundle app source
# This copies all files from the build context (where you run `docker build`)
# into the /usr/src/app directory in the image.
# Ensure app.js and any other necessary files (like .env if not using Docker's env vars,
# models/, routes/, config/, public/, views/ etc.) are in the build context.
COPY . .

# The port the application inside the container will listen on.
# Your app_1.js seems to be configured to listen on process.env.PORT || 7000
EXPOSE 7000

# The command to run when the container starts.
# This will execute your Node.js application.
CMD ["node", "app.js"]

# The ENTRYPOINT ["top", "-b"] has been removed as it was incorrect
# for running a Node.js application.
