FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
# The site is copied to a tmpfs at startup so the entrypoint can inject
# TRACKING_SCRIPT while the root filesystem stays read-only.
COPY --from=builder /app/dist /app/site
COPY html/ /app/site-view/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.d/50-polycarp.sh
RUN chmod +x /docker-entrypoint.d/50-polycarp.sh
EXPOSE 80
