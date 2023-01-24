# Reactive home deno runtime

My goal is it to provide a declarative automation experience for home assistant.

## Installation

1. Add [this repo](https://github.com/TheNoim/reactive-home) to your home assistant installation:

[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2FTheNoim%2Freactive-home)

2. Install `Reactive Home` from the addon store
3. (*Optional*, but *recommend*) Install the **Studio Code Server** addon. After you installed the addon, go to the **Studio Code Server** addon and add this command to the `init_commands` list:

`code --install-extension denoland.vscode-deno && curl -fsSL https://deno.land/x/install/install.sh | sh && echo "export DENO_INSTALL=\"/root/.deno\"" >> ~/.zshrc && echo "export PATH=\"\$DENO_INSTALL/bin:\$PATH\"" >> ~/.zshrc && mkdir -p /config/.vscode/ && echo "{\"deno.enable\":true,\"deno.unstable\":true,\"deno.importMap\":\"./reactive-home/import_map.json\"}" > /config/.vscode/settings.json`

In yaml mode it should look like this:

```yaml
init_commands:
  - >-
    code --install-extension denoland.vscode-deno && curl -fsSL
    https://deno.land/x/install/install.sh | sh && echo "export
    DENO_INSTALL=\"/root/.deno\"" >> ~/.zshrc && echo "export
    PATH=\"\$DENO_INSTALL/bin:\$PATH\"" >> ~/.zshrc && mkdir -p /config/.vscode/
    && echo "{\"deno.enable\":true,\"deno.unstable\":
    true,\"deno.importMap\":\"./reactive-home/import_map.json\"}" >
    /config/.vscode/settings.json
packages: []
```

You can also just replace the `yaml` content with this. 

Now you need to start **Studio Code Server**. I recommen to enable `Show in sidebar` for quick access. 

4. Start the `reactive-home` addon
5. Now you can start writing your scripts

## Usage

Reactive Home will load all `.ts` script files beginning with `script.` inside the `reactive-home` directory (gets created automatically). 

Example:

- `reactive-home/my-script.ts` ❌ wrong
- `reactive-home/script.my-script.ts` ✅ correct

This ensures that only files you want to run as standalone script get loaded.

The easiest way to edit your scripts is to use the **Studio Code Server** addon (Follow the installation in 3.).

*Tip*: If the IntelliSense in **Studio Code Server** stops working press Shift+Command+P (Mac) / Ctrl+Shift+P (Windows/Linux) and search for `deno: Restart Language Server`. Also make sure the dependencies are cached. If they are not cached, **Studio Code Server** will underline all missing dependencies with red. You can go with the coursor to the dependency and press Command+. (Mac) / Ctrl+. (Windows/Linux) and select `Cache "dependency" and its dependencies`. After a few seconds it should be cached and the underline should go away. *Note*: This has no effect on the script itself. This is just for **Studio Code Server**. 

### Scripts

This addon creates an `importa_map.json` file in `reactive-home/` with an import alias for you to use. The alias is `reactive-home` and gets updated to the current addon version at every startup. 

You can use it like this:

```typescript
import { useAsyncState } from 'reactive-home';

const state = await useAsyncState('some entity id');
//    ^? state is a reactive value
```

### Utilities

Currently, there is no real documentation. You can use the example scripts from [test-modules](https://github.com/TheNoim/reactive-home/tree/main/test-modules) in this repo and the [auto generated deno documentation](https://deno.land/x/reactivehome/reactive_home/src/public.ts).

Everything here is based on `@vue/reactivity`. You can find more informations [here](https://vuejs.org/guide/essentials/reactivity-fundamentals.html).