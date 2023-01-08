ARG DENO_VERSION=1.29.2

FROM denoland/deno:bin-$DENO_VERSION AS deno

ARG BUILD_FROM
FROM $BUILD_FROM

COPY --from=deno /deno /usr/local/bin/deno

COPY run.sh /

RUN chmod a+x /run.sh

CMD [ "/run.sh" ]