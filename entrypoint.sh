#!/bin/sh
set -e

# Crear nginx.conf principal con pid en directorio writable
cat > /etc/nginx/nginx.conf << 'NGINX_EOF'
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

# Crear directorio para pid file
mkdir -p /run/nginx

# Procesar nginx.conf template (puerto)
envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Generar config.js desde template con variables de entorno
envsubst '\$VITE_API_BASE_URL \$VITE_APP_NAME \$VITE_POS_BASE_URL' \
  < /usr/share/nginx/html/config.template.js \
  > /usr/share/nginx/html/config.js

# Debug: mostrar config generada
echo "=== Generated config.js ==="
cat /usr/share/nginx/html/config.js
echo "============================"

exec nginx -g "daemon off;"