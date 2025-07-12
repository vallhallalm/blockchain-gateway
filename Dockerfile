FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist .
COPY --from=builder /app/abi ./abi

EXPOSE 8080

CMD ["node", "./main.js"]
