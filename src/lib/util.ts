export type BooleanStates = boolean | "on" | "off";

export function stringBoolToBool(state: BooleanStates | string): boolean {
  return state === "on"
    ? true
    : state === "off"
    ? false
    : state === "unavailable"
    ? false
    : !!state;
}
