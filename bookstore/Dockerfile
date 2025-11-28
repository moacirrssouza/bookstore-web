# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependências
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copia código fonte
COPY . .

# Build SSR
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Instala dependências de produção
COPY package.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copia artefatos de build
COPY --from=builder /app/dist /app/dist

EXPOSE 4000

# Inicia servidor SSR
CMD ["node", "dist/bookstore/server/server.mjs"]

