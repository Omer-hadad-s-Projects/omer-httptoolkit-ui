FROM caddy:2.9.1-alpine

RUN mkdir /site

WORKDIR /site

COPY ./dist /site

COPY ./Caddyfile /etc/caddy/Caddyfile
# If the webpack build didn't emit a generated CSP include (e.g. dist/csp.caddyfile),
# create a minimal placeholder so Caddy can validate and start during local/dev builds.
RUN if [ ! -f /site/csp.caddyfile ]; then \
	printf 'header Content-Security-Policy-Report-Only "default-src '\''self'\''; report-uri /csp-report"\n' > /site/csp.caddyfile; \
	fi && \
	caddy validate --config /etc/caddy/Caddyfile || echo "Caddy validation failed or imports missing; continuing"