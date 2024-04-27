const versionRegex = /version: "(.+?)"/gim;

const configYaml = await Deno.readTextFile("/config.yaml");

const result = versionRegex.exec(configYaml);

const version = result?.at?.(1);

if (version) {
  console.log(version);
}
