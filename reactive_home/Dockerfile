ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base-debian:bullseye
ARG DENO_VERSION=1.43.6

FROM denoland/deno:bin-$DENO_VERSION AS deno

FROM $BUILD_FROM

COPY --from=deno /deno /usr/local/bin/deno

COPY run.sh /
COPY config.yaml /
COPY update-import-map.ts /

RUN chmod a+x /run.sh

CMD [ "/run.sh" ]