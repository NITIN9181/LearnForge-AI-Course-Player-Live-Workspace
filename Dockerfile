FROM node:20-slim AS deps
RUN apt-get update -y && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

FROM node:20-slim AS dev
RUN apt-get update -y && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
EXPOSE 3000
CMD ["npm", "run", "dev"]
