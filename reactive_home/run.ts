import { parse } from "https://deno.land/std@0.193.0/flags/mod.ts";
import { basename, dirname } from "https://deno.land/std@0.193.0/path/mod.ts";
import { join } from "https://deno.land/std@0.193.0/path/mod.ts";

const flags = parse(Deno.args, {
  string: ["root"],
});

async function executeScripts(abort: AbortSignal) {
  if (!flags.root) {
    console.error("Missing script root");
    return;
  }

  const args = [
    "deno",
    "run",
    `--lock=${join(flags.root, "deno.lock")}`,
    "--allow-read",
    `--allow-env=NODE_ENV,HASS_LONG_LIVED_TOKEN,HASS_URL`,
    "--allow-net",
    "--unstable", // npm import
  ];

  const importMapPath = join(flags.root, "import_map.json");

  try {
    const fileInfo = Deno.statSync(importMapPath);

    if (fileInfo && fileInfo.isFile) {
      args.push(`--import-map=${importMapPath}`);
    }
    // deno-lint-ignore no-empty
  } catch {}

  const currentFileLocation = new URL(import.meta.url);

  const process = Deno.run({
    cmd: [
      ...args,
      join(dirname(currentFileLocation.pathname), "./loader.ts"),
      "--root",
      flags.root,
    ],
  });

  abort.addEventListener("abort", () => {
    process.kill();
  });
}

if (!flags.root) {
  console.error("Missing script root");
  Deno.exit(1);
}

const watcher = Deno.watchFs(flags.root);

let abortController = new AbortController();

executeScripts(abortController.signal);

for await (const event of watcher) {
  if (!["modify", "create", "remove"].find((value) => value === event.kind)) {
    continue;
  }

  if (!event.paths.some((value) => /script\..+\.ts/gm.test(basename(value)))) {
    continue;
  }

  if (event.paths.some((value) => value.includes(".deno"))) {
    continue;
  }

  console.info(
    `Restart scripts because ${event.paths} ${
      event.kind === "modify"
        ? "got modified"
        : event.kind === "create"
        ? "got created"
        : "got removed"
    }`
  );

  abortController.abort();
  abortController = new AbortController();
  executeScripts(abortController.signal);
}
