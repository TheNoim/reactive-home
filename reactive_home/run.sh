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

deno run --lock=/deno.lock --allow-read=/config/reactive-home/import_map.json,/config.yaml --allow-write=/config/reactive-home/import_map.json /update-import-map.ts
deno run --lock=/deno.lock --allow-run --allow-read /run.ts --root /config/reactive-home