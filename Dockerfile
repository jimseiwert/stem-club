FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY packages/types ./packages/types
COPY packages/hub ./packages/hub
COPY tsconfig.base.json ./
RUN npm ci --workspace=packages/types --workspace=packages/hub
RUN npm run build --workspace=packages/types && npm run build --workspace=packages/hub
CMD ["node", "packages/hub/dist/index.js"]
