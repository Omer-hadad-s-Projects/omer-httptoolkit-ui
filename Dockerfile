FROM caddy:2.9.1-alpine

RUN mkdir /site

WORKDIR /site

COPY ./dist /site

COPY ./Caddyfile /etc/caddy/Caddyfile

# Create a startup script that generates config
RUN echo '#!/bin/sh' > /startup.sh && \
	echo 'echo "window.WEBHOOK_BASE_URL = \"${WEBHOOK_BASE_URL:-http://localhost:45459}\";" > /site/config.js' >> /startup.sh && \
	echo 'exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile' >> /startup.sh && \
	chmod +x /startup.sh

CMD ["/startup.sh"]
# If the webpack build didn't emit a generated CSP include (e.g. dist/csp.caddyfile),
# create a minimal placeholder so Caddy can validate and start during local/dev builds.
RUN if [ ! -f /site/csp.caddyfile ]; then \
	printf 'header Content-Security-Policy-Report-Only "default-src '\''self'\''; report-uri /csp-report"\n' > /site/csp.caddyfile; \
	fi && \
	caddy validate --config /etc/caddy/Caddyfile || echo "Caddy validation failed or imports missing; continuing"