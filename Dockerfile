FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package.json yarn.lock ./
RUN yarn install

# Copy source
COPY . .

# Prisma client
RUN npx prisma generate

EXPOSE 3000
