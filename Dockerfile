# ============================================
# Stage 1: Builder
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Build dependencies
RUN apk add --no-cache python3 make g++

# Cache deps layer
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

# Source + build
COPY . .
RUN npm run build

# ============================================
# Stage 2: Runtime (nginx + envsubst)
# ============================================
FROM nginx:alpine AS runtime

WORKDIR /usr/share/nginx/html

# Instalar gettext para envsubst
RUN apk add --no-cache gettext

# Copiar build output
COPY --from=builder /app/dist ./

# Copiar nginx config template + entrypoint + templates
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY entrypoint.sh /entrypoint.sh
COPY public/config.template.js ./config.template.js
COPY public/health.json ./health.json

# Crear nginx.conf principal compatible con non-root (pid en /run/nginx) - build time as root
RUN cat > /etc/nginx/nginx.conf << 'NGINX_EOF'
worker_processes auto;
pid /run/nginx/nginx.pid;
error_log /var/log/nginx/error.log warn;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile        on;
    keepalive_timeout 65;

    include /etc/nginx/conf.d/*.conf;
}
NGINX_EOF

# Crear directorio /run/nginx y dar permisos al usuario nginx (build time as root)
RUN mkdir -p /run/nginx && chown -R nginx:nginx /run/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /etc/nginx/nginx.conf && \
    chmod +x /entrypoint.sh

USER nginx

EXPOSE 5174

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]