FROM node:24-alpine AS build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend ./
COPY database/production/json /app/database/production/json
RUN npx prisma generate && npm run build

FROM node:24-alpine
WORKDIR /app/backend
ENV NODE_ENV=production
COPY --from=build /app/backend/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/backend/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/database /app/database
EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/prisma/seed.js && node dist/src/server.js"]
