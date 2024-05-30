import {
  createConnection,
  createLongLivedTokenAuth,
} from "home-assistant-js-websocket";
import { join } from "@std/path";
import { load } from "@std/dotenv";
import type { Connection, Auth } from "home-assistant-js-websocket";

const env = await load({ export: true });

const { HASS_URL, HASS_LONG_LIVED_TOKEN } = env;

if (!HASS_URL) {
  throw new Error(
    "Missing home assistant url. Provide via HASS_URL env variable or .env file"
  );
}
if (!HASS_LONG_LIVED_TOKEN) {
  throw new Error(
    "Missing long lived token. Provide via HASS_LONG_LIVED_TOKEN env variable or .env file"
  );
}

export const url: string = env.HASS_URL;

export const auth: Auth = createLongLivedTokenAuth(
  HASS_URL,
  HASS_LONG_LIVED_TOKEN
);

export const connection: Connection = await createConnection({ auth });

export function createApiCall(path: string): string {
  const callServiceUrl = new URL(url);
  callServiceUrl.pathname = join(callServiceUrl.pathname, path);
  return callServiceUrl.toString();
}
