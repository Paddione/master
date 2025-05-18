FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000

# Add debugging step
RUN echo "console.log('Docker build directory contents:'); console.log(require('fs').readdirSync('/app').join('\\n'));" > /app/debug-dir.js
CMD ["sh", "-c", "node /app/debug-dir.js && npm run dev"]"]