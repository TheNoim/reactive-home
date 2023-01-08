import {
  dotenvConfig,
  createConnection,
  createLongLivedTokenAuth,
  CliffyInput,
  join,
} from "../dep.ts";

let { HASS_URL, HASS_LONG_LIVED_TOKEN } = dotenvConfig();

if (!HASS_URL) {
  HASS_URL =
    Deno.env.get("HASS_URL") ?? (await CliffyInput.prompt("Hass url:"));
}

if (!HASS_LONG_LIVED_TOKEN) {
  HASS_LONG_LIVED_TOKEN =
    Deno.env.get("HASS_LONG_LIVED_TOKEN") ??
    (await CliffyInput.prompt("Hass long lived token:"));
}

export const url = HASS_URL;

export const auth = createLongLivedTokenAuth(HASS_URL, HASS_LONG_LIVED_TOKEN);

export const connection = await createConnection({ auth });

export function createApiCall(path: string) {
  const callServiceUrl = new URL(url);
  callServiceUrl.pathname = join(callServiceUrl.pathname, path);
  return callServiceUrl.toString();
}
