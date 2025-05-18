# webquiz Dockerfile
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you have a .npmrc file for private packages, uncomment the next line
# COPY .npmrc .

# Install dependencies for production. If you have devDependencies needed for a build step,
# you might run `npm install` first, then `npm prune --production` after the build.
RUN npm install --production

# Bundle app source
COPY . .

# Make sure your index.js and server.js are copied by the above COPY . .
# If they are not in the root of what's being copied, adjust the COPY command.

EXPOSE 3000

# The command to run when the container starts.
# This is changed from server.js to index.js, as index.js is now the entry point.
CMD ["node", "index.js"]
