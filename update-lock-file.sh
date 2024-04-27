#!/bin/bash

deno cache --reload ./reactive_home/update-import-map.ts --lock=./reactive_home/deno.lock --lock-write
deno cache --reload ./reactive_home/run.ts --lock=./reactive_home/deno.lock --lock-write
deno cache --reload ./reactive_home/loader.ts --lock=./reactive_home/deno.lock --lock-write