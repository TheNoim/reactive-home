import { walk } from "@std/fs";
import { parseArgs as parse } from "@std/cli";
import { basename, join, toFileUrl, isAbsolute } from "@std/path";

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

  const loadWorker = async () => {
    while (true) {
      const scriptUrl = toFileUrl(
        isAbsolute(path.path) ? path.path : join(Deno.cwd(), path.path)
      );
      console.info("Load script", path.path, scriptUrl.href);

      const worker = new Worker(scriptUrl, {
        type: "module",
        deno: {
          permissions: "inherit",
        },
      });

      await new Promise((resolve) => {
        worker.onerror = (error) => {
          error.preventDefault();
          console.error(
            `Terminate worker ${path.path} because of an error. Restart in 5s.`,
            error.error
          );
          setTimeout(() => {
            console.log(`Will now restart ${path.path}`);
            resolve(null);
          }, 5 * 1000);
        };
      });

      worker.terminate();
    }
  };

  loadWorker();
}
