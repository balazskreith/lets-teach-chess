FROM node:22-alpine AS build

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY package.json package-lock.json ./
COPY . .

RUN npm ci && npm run build && npm prune

# Run
FROM node:22-alpine

WORKDIR /app

# Copy only the standalone output and static files
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
