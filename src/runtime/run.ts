import { join, basename } from "@std/path";
import { parseArgs as parse } from "@std/cli";

const flags = parse(Deno.args, {
  string: ["root", "pkg"],
  boolean: ["local-test"],
});

async function executeScripts(abort: AbortSignal) {
  if (!flags.root) {
    console.error("Missing script root");
    return;
  }

  const args = [
    "run",
    `--lock=${join(flags.root, "deno.lock")}`,
    "--allow-read",
    "--allow-env",
    "--allow-net",
    "--allow-sys",
    "--unstable-worker-options",
  ];

  const importMapPath = join(flags.root, "import_map.json");

  try {
    const fileInfo = Deno.statSync(importMapPath);

    if (fileInfo && fileInfo.isFile) {
      args.push(`--import-map=${importMapPath}`);
    }
    // deno-lint-ignore no-empty
  } catch {}

  const process = new Deno.Command(Deno.execPath(), {
    args: [...args, "-", "--root", flags.root],
    stdin: "piped",
    stdout: "inherit",
    stderr: "inherit",
  }).spawn();

  const writer = process.stdin.getWriter();

  await writer.write(
    new TextEncoder().encode(
      `import "${
        flags["local-test"]
          ? "./src/runtime/loader.ts"
          : `${flags.pkg ?? "reactive-home"}/loader`
      }";`
    )
  );

  await writer.close();

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
  await executeScripts(abortController.signal);
}
