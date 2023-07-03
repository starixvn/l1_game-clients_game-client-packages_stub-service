FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:lts-alpine AS cleaner
WORKDIR /app
COPY package*.json .
RUN npm install --omit=dev
RUN npx mod-pruner prune --force && rm package-lock.json
COPY --from=builder /app/dist dist

FROM node:lts-alpine
USER node
ENV PORT 8080
ENV CORS_ORIGIN *
ENV NAMESPACES "/"
ENV DATA_DIR "/builds/tests/integration-tests"
WORKDIR /app
EXPOSE ${PORT}
COPY --from=cleaner /app ./
CMD [ "node", "dist/app" ]
