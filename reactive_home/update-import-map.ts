const versionRegex = /version: "(.+?)"/gim;

const configYaml = await Deno.readTextFile("/config.yaml");

const result = versionRegex.exec(configYaml);

const version = result?.at?.(1);

if (version) {
  const importMapText = await Deno.readTextFile(
    "/config/reactive-home/import_map.json"
  );

  let importMapJson: Record<string, any> = {};

  try {
    importMapJson = JSON.parse(importMapText);
  } catch (e) {
    console.error("Failed to parse import map. Recreate import map.", e);
  }

  if (!importMapJson.imports) {
    importMapJson.imports = {};
  }

  console.log(`Set reactivehome version to v${version}`);

  importMapJson.imports[
    "reactive-home"
  ] = `https://deno.land/x/reactivehome@v${version}/mod.ts`;

  await Deno.writeTextFile(
    "/config/reactive-home/import_map.json",
    JSON.stringify(importMapJson, null, 2)
  );
}
