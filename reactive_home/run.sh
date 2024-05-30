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


PKG_VERSION_SCRIPT="
import file from '/config/reactive-home/import_map.json' with { type: 'json' };
console.log(file.imports['reactive-home'])
"

PKG_VERSION=$(echo "$PKG_VERSION_SCRIPT" | deno run -)

echo "Load runtime..."
echo "import '$PKG_VERSION/runtime'" | deno run --import-map=/config/reactive-home/import_map.json --allow-env --allow-net --allow-run --allow-sys --allow-read - --root /config/reactive-home --pkg "$PKG_VERSION"