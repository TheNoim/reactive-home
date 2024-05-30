import { connection } from "../hass/connection.ts";
import { configColl } from "../dep.ts";
import { reactive } from "../dep.ts";
import type { HassConfig } from "../dep.ts";

const configCollection = configColl(connection);

await configCollection.refresh();

export function useHassConfig() {
  const config = reactive(configCollection.state ?? ({} as HassConfig));

  configCollection.subscribe((newConfig) => {
    for (const property in newConfig) {
      (config as Record<string, any>)[property] = (
        newConfig as Record<string, any>
      )[property];
    }
  });

  return config;
}
