# Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package*.json ./

# Install dependencies with npm ci for reproducible builds
RUN npm ci

# Copy the rest of the project
COPY . .

# Build the optimized static files
RUN npm run build

# Stage 2: Serve with Nginx
# FROM nginx:alpine

# # Copy build output from builder stage to Nginx's default HTML directory
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Write Nginx config with SPA fallback so React Router routes work
# RUN printf 'server {\n\
#     listen 80;\n\
#     root /usr/share/nginx/html;\n\
#     index index.html;\n\
# \n\
#     location / {\n\
#         try_files $uri $uri/ /index.html;\n\
#     }\n\
# }\n' > /etc/nginx/conf.d/default.conf

# # Expose port 80
# EXPOSE 80

# # Health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#     CMD test -f /usr/share/nginx/html/index.html || exit 1

# # Start Nginx
# CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Serve with Node.js
FROM node:20-alpine

RUN npm install -g serve
COPY --from=builder /app/dist /app/dist
EXPOSE 3000
CMD ["serve", "-s", "/app/dist", "-l", "3000"]