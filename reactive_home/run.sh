#!/usr/bin/with-contenv bashio

export HASS_LONG_LIVED_TOKEN=$SUPERVISOR_TOKEN
export HASS_URL=http://supervisor/core
export DENO_DIR=/config/reactive-home/.deno

mkdir -p /config/reactive-home

if [[ ! -f /config/reactive-home/import_map.json ]]; then
  echo "{
    \"imports\": {
        \"reactive-home\": \"https://deno.land/x/reactivehome@0.2.12/mod.ts\"
    }
  }" >> /config/reactive-home/import_map.json
fi

mkdir -p /config/reactive-home/deno_cache/npm
mkdir -p /config/reactive-home/deno_cache/deps
mkdir -p /config/reactive-home/deno_cache/gen

mkdir -p /deno_cache/npm
mkdir -p /deno_cache/deps
mkdir -p /deno_cache/gen

echo "/deno_image_cache/npm=RO:/config/reactive-home/deno_cache/npm   /deno_cache/npm   mergerfs    cache.files=off   0   0" >> /etc/fstab
echo "/deno_image_cache/deps=RO:/config/reactive-home/deno_cache/deps   /deno_cache/deps   mergerfs    cache.files=off   0   0" >> /etc/fstab
echo "/deno_image_cache/gen=RO:/config/reactive-home/deno_cache/gen   /deno_cache/gen   mergerfs    cache.files=off   0   0" >> /etc/fstab

mount -a

DENO_DIR=/deno_cache deno run --lock=/deno.lock --allow-read=/config/reactive-home/import_map.json,/config.yaml --allow-write=/config/reactive-home/import_map.json /update-import-map.ts
DENO_DIR=/deno_cache deno run --lock=/deno.lock --allow-env --allow-net --allow-run --allow-sys --allow-read /run.ts --root /config/reactive-home