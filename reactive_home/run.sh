#!/usr/bin/with-contenv bashio

export HASS_LONG_LIVED_TOKEN=$SUPERVISOR_TOKEN
export HASS_URL=http://supervisor/core
export DENO_DIR=/config/reactive-home/.deno

mkdir -p /config/reactive-home

if [[ ! -f /config/reactive-home/import_map.json ]]; then
  echo "{
    \"imports\": {
        \"reactive-home\": \"jsr:@noim/reactive-home@0.8.3\"
    }
  }" >> /config/reactive-home/import_map.json
fi

deno run --lock=/deno.lock --allow-read=/config/reactive-home/import_map.json,/config.yaml --allow-write=/config/reactive-home/import_map.json /update-import-map.ts

echo "Load runtime..."
echo "import 'reactive-home/runtime'" | deno run --allow-env --allow-net --allow-run --allow-sys --allow-read - --root /config/reactive-home