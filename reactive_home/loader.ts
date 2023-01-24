import { walk } from "https://deno.land/std@0.173.0/fs/mod.ts";
import { parse } from "https://deno.land/std@0.173.0/flags/mod.ts";
import { basename, join } from "https://deno.land/std@0.173.0/path/mod.ts";

const flags = parse(Deno.args, {
  string: ["root"],
});

if (!flags.root) {
  console.error("Missing root parameter");
  Deno.exit(1);
}

for await (const path of walk(flags.root)) {
  if (!path.isFile) {
    continue;
  }

  if (path.path.includes(".deno")) {
    continue;
  }

  const fileName = basename(path.path);

  if (!/script\..+\.ts/gm.test(fileName)) {
    continue;
  }

  console.info("Load script", path.path);

  const loadWorker = async () => {
    while (true) {
      const worker = new Worker(
        new URL(join(Deno.cwd(), path.path), import.meta.url).href,
        {
          type: "module",
        }
      );

      await new Promise((resolve) => {
        worker.onerror = (error) => {
          console.error(
            `Terminate worker ${path.path} because of an error. Restart in 5s.`,
            error
          );
          worker.terminate();
          setTimeout(() => {
            resolve(null);
          }, 5 * 1000);
        };
      });
    }
  };

  loadWorker();
}
