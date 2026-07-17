# Stage 1: Build React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

RUN apk add --no-cache gettext

# Copy React build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template (IMPORTANT LOCATION)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Runtime configuration for React
COPY docker-entrypoint.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]