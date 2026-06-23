FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ---- Development stage (hot-reload) ----
FROM deps AS dev
COPY . .
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=development
EXPOSE 3000
CMD ["sh", "-c", "npm install --prefer-offline && npm run dev"]

# ---- Production build ----
FROM deps AS builder
# next.config.ts bakes the /api rewrite destination at build time, so the
# internal backend URL must be present during `next build`.
ARG INTERNAL_API_URL=http://backend:8000
ENV INTERNAL_API_URL=$INTERNAL_API_URL
COPY . .
RUN npm run build

# ---- Production runner ----
FROM node:20-alpine AS runner
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY package.json next.config.ts ./
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
