FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

FROM base AS production
ENV NODE_ENV=production
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
USER node
CMD ["node", "src/server.js"]

FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npx", "nodemon", "src/server.js"]
