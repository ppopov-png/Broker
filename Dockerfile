FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages
COPY tsconfig.base.json ./

RUN npm ci --prefer-offline --no-audit --no-fund \
 && npm run build --workspace=@trigonum/site -- --base=/ \
 && npm run build --workspace=@trigonum/onboarding -- --base=/open/ \
 && npm run build --workspace=@trigonum/cabinet -- --base=/app/

FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/site/dist/ /usr/share/nginx/html/
COPY --from=build /app/apps/onboarding/dist/ /usr/share/nginx/html/open/
COPY --from=build /app/apps/cabinet/dist/ /usr/share/nginx/html/app/

EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
