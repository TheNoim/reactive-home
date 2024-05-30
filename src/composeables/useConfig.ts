import { configColl, type HassConfig } from "home-assistant-js-websocket";
import { connection } from "../hass/connection.ts";
import { reactive } from "@vue/reactivity";

const configCollection = configColl(connection);

await configCollection.refresh();

export function useHassConfig(): HassConfig {
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
