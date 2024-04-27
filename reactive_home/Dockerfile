ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base-debian:bullseye
ARG DENO_VERSION=1.42.4

FROM denoland/deno:bin-$DENO_VERSION AS deno

FROM $BUILD_FROM

ENV DEBIAN_FRONTEND=noninteractive

COPY --from=deno /deno /usr/local/bin/deno

RUN apt update && \
  apt install mergerfs -yq && \
  rm -rf /var/lib/apt/lists/*

COPY run.sh /
COPY deno.lock /
COPY run.ts /
COPY loader.ts /
COPY config.yaml /
COPY update-import-map.ts /
COPY get-version.ts /

ENV DENO_DIR=/deno_image_cache

RUN chmod a+x /run.sh && \
  mkdir /deno_image_cache && \
  deno cache "https://deno.land/x/reactivehome@$(deno run --allow-all /get-version.ts)/mod.ts" && \
  deno cache /loader.ts

CMD [ "/run.sh" ]