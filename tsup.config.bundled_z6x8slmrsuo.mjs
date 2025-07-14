var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// tsup/constants.ts
var DIR_DST, DIR_DST_ASSETS, DIR_SRC, DIR_SRC_ASSETS;
var init_constants = __esm({
  "tsup/constants.ts"() {
    DIR_DST = "build/resources/main";
    DIR_DST_ASSETS = `${DIR_DST}/assets`;
    DIR_SRC = "src/main/resources";
    DIR_SRC_ASSETS = `${DIR_SRC}/assets`;
  }
});

// tsup/server.ts
var server_exports = {};
__export(server_exports, {
  default: () => buildServerConfig
});
import { globSync } from "glob";
function buildServerConfig() {
  const GLOB_EXTENSIONS_SERVER = "{ts,js,es6}";
  const FILES_SERVER = globSync(`${DIR_SRC}/**/*.${GLOB_EXTENSIONS_SERVER}`, {
    absolute: false,
    ignore: [...globSync(`${DIR_SRC_ASSETS}/**/*.${GLOB_EXTENSIONS_SERVER}`), ...globSync(`${DIR_SRC}/**/*.test.js`)]
  }).map((s) => s.replaceAll("\\", "/"));
  return {
    bundle: true,
    // Needed to bundle @enonic/js-utils
    dts: false,
    // d.ts files are use useless at runtime
    entry: FILES_SERVER,
    env: {
      BROWSER_SYNC_PORT: "3000"
    },
    esbuildOptions(options) {
      options.chunkNames = "_chunks/[name]-[hash]";
      options.mainFields = ["module", "main"];
    },
    loader: {
      ".es6": "js"
    },
    external: [/^\/lib\//, /^\/react4xp\//, /^\/site\//],
    format: "cjs",
    inject: [
      // Injects makes it possible to use some functionality in any file :)
      // However it also makes every file larger, unless splitting: true
      // If for some reason you cannot use code splitting, it is better
      // to import a polyfill only in the entries that needs it.
      // Code-js polyfills share code, so together they don't add the sum of all the polyfills.
      // For example injecting both number/is-finite and is-integer only adds 60K, not 108K
      // Here are some things Nashorn doesn't support, comment them in to inject them:
      // 'node_modules/core-js/stable/array/flat.js',        // 69K (18K) minified
      // 'node_modules/core-js/stable/array/includes.js',    // 60K (15K)
      // 'node_modules/core-js/stable/math/trunc.js',        // 53K (14K)
      // 'node_modules/core-js/stable/number/is-finite.js',  // 54K (14K)
      // 'node_modules/core-js/stable/number/is-integer.js', // 54K (14K)
      // 'node_modules/core-js/stable/parse-float.js',       // 59K (15K)
      // 'node_modules/core-js/stable/reflect/index.js',     // 88K (22K)
      // 'node_modules/core-js/stable/string/pad-start.js',
      // TIP: I used this command to find sizes
      // npm --silent run clean && npm --silent run build:server; ls -lh build/resources/main/empty.js; npm --silent run clean && npm --silent run build:server -- --minify; ls -lh build/resources/main/empty.js
    ],
    minify: false,
    // Minifying server files makes debugging harder
    // TIP: Command to check if there are any bad requires left behind
    // grep -r 'require("' build/resources/main | grep -v 'require("/'|grep -v chunk
    noExternal: ["date-fns", "striptags"],
    platform: "neutral",
    silent: ["QUIET", "WARN"].includes(process.env.LOG_LEVEL_FROM_GRADLE || ""),
    shims: false,
    // https://tsup.egoist.dev/#inject-cjs-and-esm-shims
    splitting: false,
    // Splitting makes resolve('MyHtml') not work since the splitted files are not in the same location as the original, so the relative path breaks
    sourcemap: false,
    target: "es5"
  };
}
var init_server = __esm({
  "tsup/server.ts"() {
    init_constants();
  }
});

// tsup/client-asset.ts
var client_asset_exports = {};
__export(client_asset_exports, {
  default: () => buildAssetConfig
});
import { globSync as globSync2 } from "glob";
import { sassPlugin } from "esbuild-sass-plugin";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import cssnanoPlugin from "cssnano";
function buildAssetConfig() {
  const isDev = process.env.NODE_ENV === "development";
  const SCRIPT_GLOB_EXTENSIONS_ASSETS = "{tsx,ts,jsx,js,es6}";
  const SCRIPT_FILES_ASSETS = globSync2(`${DIR_SRC_ASSETS}/**/*.${SCRIPT_GLOB_EXTENSIONS_ASSETS}`).map((s) => s.replaceAll("\\", "/")).reduce((acc, path) => {
    const fileName = path.split("/").pop();
    if (!fileName) {
      acc[path] = path;
    } else {
      acc[`js/${fileName.split(".")[0]}`] = path;
    }
    return acc;
  }, {});
  const STYLE_FILES_ASSETS = {
    "styles/bundle": `${DIR_SRC_ASSETS}/styles/main.scss`,
    "styles/bundle_menu": `${DIR_SRC_ASSETS}/styles/main_menu.scss`
  };
  return {
    bundle: true,
    dts: false,
    // d.ts files are use useless at runtime
    entry: { ...SCRIPT_FILES_ASSETS, ...STYLE_FILES_ASSETS },
    esbuildPlugins: [
      // TSUP/Esbuild plugins don't have a great watching mechanism, so we use sass cli for that
      // We keep the sassPlugin for autoprefixer and cssnano used when building for production
      sassPlugin({
        // These settings should match build:style in package.json somewhat
        style: isDev ? "expanded" : "compressed",
        loadPaths: ["node_modules", "node_modules/bootstrap/scss", "node_modules/@statisticsnorway"],
        async transform(source) {
          const transformers = [autoprefixer];
          if (!isDev) transformers.push(cssnanoPlugin);
          const { css } = await postcss(transformers).process(source);
          return css;
        }
      })
    ],
    loader: {
      ".es6": "js"
    },
    outExtension({ format }) {
      if (format === "iife") return { js: ".legacy.js" };
      return {
        js: ".js"
      };
    },
    // By default tsup bundles all imported modules, but dependencies
    // and peerDependencies in your packages.json are always excluded
    external: [
      // Must be loaded into global scope instead
    ],
    format: [
      "iife",
      // For browser
      // 'cjs', // Legacy browser support
      "esm"
    ],
    minify: isDev ? false : true,
    // TIP: Command to check if there are any bad requires left behind
    // grep -r 'require("' build/resources/main | grep -v 'require("/'|grep -v chunk
    noExternal: ["zipcelx", "bootstrap/js/dist/collapse"],
    target: "es2020",
    platform: "browser",
    silent: ["QUIET", "WARN"].includes(process.env.LOG_LEVEL_FROM_GRADLE || ""),
    splitting: true,
    sourcemap: isDev ? false : true,
    tsconfig: `${DIR_SRC_ASSETS}/tsconfig.json`
  };
}
var init_client_asset = __esm({
  "tsup/client-asset.ts"() {
    init_constants();
  }
});

// tsup.config.ts
init_constants();
import { defineConfig } from "tsup";
var tsup_config_default = defineConfig((options) => {
  if (options.d === DIR_DST) {
    return Promise.resolve().then(() => (init_server(), server_exports)).then((m) => m.default());
  }
  if (options.d === DIR_DST_ASSETS) {
    return Promise.resolve().then(() => (init_client_asset(), client_asset_exports)).then((m) => m.default());
  }
  throw new Error(`Unconfigured directory: ${options.d}!`);
});
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC9jb25zdGFudHMudHMiLCAidHN1cC9zZXJ2ZXIudHMiLCAidHN1cC9jbGllbnQtYXNzZXQudHMiLCAidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL2pzdS9Eb2N1bWVudHMvU1NCL3JlcG8vbWltaXIvdHN1cC9jb25zdGFudHMudHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL1VzZXJzL2pzdS9Eb2N1bWVudHMvU1NCL3JlcG8vbWltaXIvdHN1cFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vVXNlcnMvanN1L0RvY3VtZW50cy9TU0IvcmVwby9taW1pci90c3VwL2NvbnN0YW50cy50c1wiO2V4cG9ydCBjb25zdCBESVJfRFNUID0gJ2J1aWxkL3Jlc291cmNlcy9tYWluJ1xuZXhwb3J0IGNvbnN0IERJUl9EU1RfQVNTRVRTID0gYCR7RElSX0RTVH0vYXNzZXRzYFxuXG5leHBvcnQgY29uc3QgRElSX1NSQyA9ICdzcmMvbWFpbi9yZXNvdXJjZXMnXG5leHBvcnQgY29uc3QgRElSX1NSQ19BU1NFVFMgPSBgJHtESVJfU1JDfS9hc3NldHNgXG4iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCIvVXNlcnMvanN1L0RvY3VtZW50cy9TU0IvcmVwby9taW1pci90c3VwL3NlcnZlci50c1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCIvVXNlcnMvanN1L0RvY3VtZW50cy9TU0IvcmVwby9taW1pci90c3VwXCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy9Vc2Vycy9qc3UvRG9jdW1lbnRzL1NTQi9yZXBvL21pbWlyL3RzdXAvc2VydmVyLnRzXCI7aW1wb3J0IHsgZ2xvYlN5bmMgfSBmcm9tICdnbG9iJ1xuLy8gaW1wb3J0IHsgcG9seWZpbGxOb2RlIH0gZnJvbSAnZXNidWlsZC1wbHVnaW4tcG9seWZpbGwtbm9kZSc7XG4vLyBpbXBvcnQgeyBwcmludCB9IGZyb20gJ3EtaSc7XG5pbXBvcnQgeyBESVJfU1JDLCBESVJfU1JDX0FTU0VUUyB9IGZyb20gJy4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgdHlwZSBPcHRpb25zIH0gZnJvbSAnLidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYnVpbGRTZXJ2ZXJDb25maWcoKTogT3B0aW9ucyB7XG4gIGNvbnN0IEdMT0JfRVhURU5TSU9OU19TRVJWRVIgPSAne3RzLGpzLGVzNn0nXG4gIGNvbnN0IEZJTEVTX1NFUlZFUiA9IGdsb2JTeW5jKGAke0RJUl9TUkN9LyoqLyouJHtHTE9CX0VYVEVOU0lPTlNfU0VSVkVSfWAsIHtcbiAgICBhYnNvbHV0ZTogZmFsc2UsXG4gICAgaWdub3JlOiBbLi4uZ2xvYlN5bmMoYCR7RElSX1NSQ19BU1NFVFN9LyoqLyouJHtHTE9CX0VYVEVOU0lPTlNfU0VSVkVSfWApLCAuLi5nbG9iU3luYyhgJHtESVJfU1JDfS8qKi8qLnRlc3QuanNgKV0sXG4gIH0pLm1hcCgocykgPT4gcy5yZXBsYWNlQWxsKCdcXFxcJywgJy8nKSkgLy8gV2luZG93cyBPUyBmaXhcbiAgLy8gcHJpbnQoRklMRVNfU0VSVkVSLCB7IG1heEl0ZW1zOiBJbmZpbml0eSB9KTtcblxuICByZXR1cm4ge1xuICAgIGJ1bmRsZTogdHJ1ZSwgLy8gTmVlZGVkIHRvIGJ1bmRsZSBAZW5vbmljL2pzLXV0aWxzXG4gICAgZHRzOiBmYWxzZSwgLy8gZC50cyBmaWxlcyBhcmUgdXNlIHVzZWxlc3MgYXQgcnVudGltZVxuICAgIGVudHJ5OiBGSUxFU19TRVJWRVIsXG4gICAgZW52OiB7XG4gICAgICBCUk9XU0VSX1NZTkNfUE9SVDogJzMwMDAnLFxuICAgIH0sXG4gICAgZXNidWlsZE9wdGlvbnMob3B0aW9ucykge1xuICAgICAgLy8gb3B0aW9ucy5hbGlhcyA9IHtcbiAgICAgIC8vIFx0J2FsaWFzJzogJy4vc3JjL21haW4vcmVzb3VyY2VzL2xpYi9maWxlbmFtZS5qcydcbiAgICAgIC8vIH07XG5cbiAgICAgIC8vIFNvbWUgbm9kZSBtb2R1bGVzIG1pZ2h0IG5lZWQgZ2xvYmFsVGhpc1xuICAgICAgLy8gb3B0aW9ucy5iYW5uZXIgPSB7XG4gICAgICAvLyBcdGpzOiBgY29uc3QgZ2xvYmFsVGhpcyA9ICgxLCBldmFsKSgndGhpcycpO2AgLy8gYnVmZmVyIHBvbHlmaWxsIG5lZWRzIHRoaXNcbiAgICAgIC8vIH07XG5cbiAgICAgIC8vIElmIHlvdSBoYXZlIGxpYnMgd2l0aCBjaHVua3MsIHVzZSB0aGlzIHRvIGF2b2lkIGNvbGxpc2lvbnNcbiAgICAgIG9wdGlvbnMuY2h1bmtOYW1lcyA9ICdfY2h1bmtzL1tuYW1lXS1baGFzaF0nXG5cbiAgICAgIG9wdGlvbnMubWFpbkZpZWxkcyA9IFsnbW9kdWxlJywgJ21haW4nXVxuICAgIH0sXG4gICAgbG9hZGVyOiB7XG4gICAgICAnLmVzNic6ICdqcycsXG4gICAgfSxcbiAgICBleHRlcm5hbDogWy9eXFwvbGliXFwvLywgL15cXC9yZWFjdDR4cFxcLy8sIC9eXFwvc2l0ZVxcLy9dLFxuICAgIGZvcm1hdDogJ2NqcycsXG4gICAgaW5qZWN0OiBbXG4gICAgICAvLyBJbmplY3RzIG1ha2VzIGl0IHBvc3NpYmxlIHRvIHVzZSBzb21lIGZ1bmN0aW9uYWxpdHkgaW4gYW55IGZpbGUgOilcbiAgICAgIC8vIEhvd2V2ZXIgaXQgYWxzbyBtYWtlcyBldmVyeSBmaWxlIGxhcmdlciwgdW5sZXNzIHNwbGl0dGluZzogdHJ1ZVxuICAgICAgLy8gSWYgZm9yIHNvbWUgcmVhc29uIHlvdSBjYW5ub3QgdXNlIGNvZGUgc3BsaXR0aW5nLCBpdCBpcyBiZXR0ZXJcbiAgICAgIC8vIHRvIGltcG9ydCBhIHBvbHlmaWxsIG9ubHkgaW4gdGhlIGVudHJpZXMgdGhhdCBuZWVkcyBpdC5cbiAgICAgIC8vIENvZGUtanMgcG9seWZpbGxzIHNoYXJlIGNvZGUsIHNvIHRvZ2V0aGVyIHRoZXkgZG9uJ3QgYWRkIHRoZSBzdW0gb2YgYWxsIHRoZSBwb2x5ZmlsbHMuXG4gICAgICAvLyBGb3IgZXhhbXBsZSBpbmplY3RpbmcgYm90aCBudW1iZXIvaXMtZmluaXRlIGFuZCBpcy1pbnRlZ2VyIG9ubHkgYWRkcyA2MEssIG5vdCAxMDhLXG4gICAgICAvLyBIZXJlIGFyZSBzb21lIHRoaW5ncyBOYXNob3JuIGRvZXNuJ3Qgc3VwcG9ydCwgY29tbWVudCB0aGVtIGluIHRvIGluamVjdCB0aGVtOlxuICAgICAgLy8gJ25vZGVfbW9kdWxlcy9jb3JlLWpzL3N0YWJsZS9hcnJheS9mbGF0LmpzJywgICAgICAgIC8vIDY5SyAoMThLKSBtaW5pZmllZFxuICAgICAgLy8gJ25vZGVfbW9kdWxlcy9jb3JlLWpzL3N0YWJsZS9hcnJheS9pbmNsdWRlcy5qcycsICAgIC8vIDYwSyAoMTVLKVxuICAgICAgLy8gJ25vZGVfbW9kdWxlcy9jb3JlLWpzL3N0YWJsZS9tYXRoL3RydW5jLmpzJywgICAgICAgIC8vIDUzSyAoMTRLKVxuICAgICAgLy8gJ25vZGVfbW9kdWxlcy9jb3JlLWpzL3N0YWJsZS9udW1iZXIvaXMtZmluaXRlLmpzJywgIC8vIDU0SyAoMTRLKVxuICAgICAgLy8gJ25vZGVfbW9kdWxlcy9jb3JlLWpzL3N0YWJsZS9udW1iZXIvaXMtaW50ZWdlci5qcycsIC8vIDU0SyAoMTRLKVxuICAgICAgLy8gJ25vZGVfbW9kdWxlcy9jb3JlLWpzL3N0YWJsZS9wYXJzZS1mbG9hdC5qcycsICAgICAgIC8vIDU5SyAoMTVLKVxuICAgICAgLy8gJ25vZGVfbW9kdWxlcy9jb3JlLWpzL3N0YWJsZS9yZWZsZWN0L2luZGV4LmpzJywgICAgIC8vIDg4SyAoMjJLKVxuICAgICAgLy8gJ25vZGVfbW9kdWxlcy9jb3JlLWpzL3N0YWJsZS9zdHJpbmcvcGFkLXN0YXJ0LmpzJyxcbiAgICAgIC8vIFRJUDogSSB1c2VkIHRoaXMgY29tbWFuZCB0byBmaW5kIHNpemVzXG4gICAgICAvLyBucG0gLS1zaWxlbnQgcnVuIGNsZWFuICYmIG5wbSAtLXNpbGVudCBydW4gYnVpbGQ6c2VydmVyOyBscyAtbGggYnVpbGQvcmVzb3VyY2VzL21haW4vZW1wdHkuanM7IG5wbSAtLXNpbGVudCBydW4gY2xlYW4gJiYgbnBtIC0tc2lsZW50IHJ1biBidWlsZDpzZXJ2ZXIgLS0gLS1taW5pZnk7IGxzIC1saCBidWlsZC9yZXNvdXJjZXMvbWFpbi9lbXB0eS5qc1xuICAgIF0sXG4gICAgbWluaWZ5OiBmYWxzZSwgLy8gTWluaWZ5aW5nIHNlcnZlciBmaWxlcyBtYWtlcyBkZWJ1Z2dpbmcgaGFyZGVyXG5cbiAgICAvLyBUSVA6IENvbW1hbmQgdG8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBiYWQgcmVxdWlyZXMgbGVmdCBiZWhpbmRcbiAgICAvLyBncmVwIC1yICdyZXF1aXJlKFwiJyBidWlsZC9yZXNvdXJjZXMvbWFpbiB8IGdyZXAgLXYgJ3JlcXVpcmUoXCIvJ3xncmVwIC12IGNodW5rXG4gICAgbm9FeHRlcm5hbDogWydkYXRlLWZucycsICdzdHJpcHRhZ3MnXSxcblxuICAgIHBsYXRmb3JtOiAnbmV1dHJhbCcsXG4gICAgc2lsZW50OiBbJ1FVSUVUJywgJ1dBUk4nXS5pbmNsdWRlcyhwcm9jZXNzLmVudi5MT0dfTEVWRUxfRlJPTV9HUkFETEUgfHwgJycpLFxuICAgIHNoaW1zOiBmYWxzZSwgLy8gaHR0cHM6Ly90c3VwLmVnb2lzdC5kZXYvI2luamVjdC1janMtYW5kLWVzbS1zaGltc1xuICAgIHNwbGl0dGluZzogZmFsc2UsIC8vIFNwbGl0dGluZyBtYWtlcyByZXNvbHZlKCdNeUh0bWwnKSBub3Qgd29yayBzaW5jZSB0aGUgc3BsaXR0ZWQgZmlsZXMgYXJlIG5vdCBpbiB0aGUgc2FtZSBsb2NhdGlvbiBhcyB0aGUgb3JpZ2luYWwsIHNvIHRoZSByZWxhdGl2ZSBwYXRoIGJyZWFrc1xuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgdGFyZ2V0OiAnZXM1JyxcbiAgfVxufVxuIiwgImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL2pzdS9Eb2N1bWVudHMvU1NCL3JlcG8vbWltaXIvdHN1cC9jbGllbnQtYXNzZXQudHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL1VzZXJzL2pzdS9Eb2N1bWVudHMvU1NCL3JlcG8vbWltaXIvdHN1cFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vVXNlcnMvanN1L0RvY3VtZW50cy9TU0IvcmVwby9taW1pci90c3VwL2NsaWVudC1hc3NldC50c1wiO2ltcG9ydCB7IGdsb2JTeW5jIH0gZnJvbSAnZ2xvYidcbmltcG9ydCB7IHNhc3NQbHVnaW4gfSBmcm9tICdlc2J1aWxkLXNhc3MtcGx1Z2luJ1xuaW1wb3J0IHBvc3Rjc3MgZnJvbSAncG9zdGNzcydcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJ1xuaW1wb3J0IGNzc25hbm9QbHVnaW4gZnJvbSAnY3NzbmFubydcbi8vIGltcG9ydCB7IHByaW50IH0gZnJvbSAncS1pJztcbmltcG9ydCB7IERJUl9TUkNfQVNTRVRTIH0gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQgeyB0eXBlIE9wdGlvbnMgfSBmcm9tICcuJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBidWlsZEFzc2V0Q29uZmlnKCk6IE9wdGlvbnMge1xuICBjb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnXG4gIGNvbnN0IFNDUklQVF9HTE9CX0VYVEVOU0lPTlNfQVNTRVRTID0gJ3t0c3gsdHMsanN4LGpzLGVzNn0nXG5cbiAgLy8gVXNlIG9iamVjdCBlbnRyeSB0byBmb3JjZSBmbGF0IG91dHB1dCBmb2xkZXIgc3RydWN0dXJlLCBvYmplY3Qga2V5IGlzIGRlc3RpbmF0aW9uIHBhdGhcbiAgY29uc3QgU0NSSVBUX0ZJTEVTX0FTU0VUUyA9IGdsb2JTeW5jKGAke0RJUl9TUkNfQVNTRVRTfS8qKi8qLiR7U0NSSVBUX0dMT0JfRVhURU5TSU9OU19BU1NFVFN9YClcbiAgICAubWFwKChzKSA9PiBzLnJlcGxhY2VBbGwoJ1xcXFwnLCAnLycpKVxuICAgIC5yZWR1Y2UoKGFjYywgcGF0aCkgPT4ge1xuICAgICAgY29uc3QgZmlsZU5hbWUgPSBwYXRoLnNwbGl0KCcvJykucG9wKClcbiAgICAgIGlmICghZmlsZU5hbWUpIHtcbiAgICAgICAgYWNjW3BhdGhdID0gcGF0aFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWNjW2Bqcy8ke2ZpbGVOYW1lLnNwbGl0KCcuJylbMF19YF0gPSBwYXRoXG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjXG4gICAgfSwge30pXG5cbiAgLy8gTm90IHVzaW5nIGdsb2IgZm9yIHN0eWxlcywgYmVjYXVzZSB3ZSB3YW50IHRvIGJ1bmRsZSB0aGVtXG4gIGNvbnN0IFNUWUxFX0ZJTEVTX0FTU0VUUyA9IHtcbiAgICAnc3R5bGVzL2J1bmRsZSc6IGAke0RJUl9TUkNfQVNTRVRTfS9zdHlsZXMvbWFpbi5zY3NzYCxcbiAgICAnc3R5bGVzL2J1bmRsZV9tZW51JzogYCR7RElSX1NSQ19BU1NFVFN9L3N0eWxlcy9tYWluX21lbnUuc2Nzc2AsXG4gIH1cblxuICAvLyBwcmludChGSUxFU19BU1NFVFMsIHsgbWF4SXRlbXM6IEluZmluaXR5IH0pO1xuICByZXR1cm4ge1xuICAgIGJ1bmRsZTogdHJ1ZSxcbiAgICBkdHM6IGZhbHNlLCAvLyBkLnRzIGZpbGVzIGFyZSB1c2UgdXNlbGVzcyBhdCBydW50aW1lXG4gICAgZW50cnk6IHsgLi4uU0NSSVBUX0ZJTEVTX0FTU0VUUywgLi4uU1RZTEVfRklMRVNfQVNTRVRTIH0sXG4gICAgZXNidWlsZFBsdWdpbnM6IFtcbiAgICAgIC8vIFRTVVAvRXNidWlsZCBwbHVnaW5zIGRvbid0IGhhdmUgYSBncmVhdCB3YXRjaGluZyBtZWNoYW5pc20sIHNvIHdlIHVzZSBzYXNzIGNsaSBmb3IgdGhhdFxuICAgICAgLy8gV2Uga2VlcCB0aGUgc2Fzc1BsdWdpbiBmb3IgYXV0b3ByZWZpeGVyIGFuZCBjc3NuYW5vIHVzZWQgd2hlbiBidWlsZGluZyBmb3IgcHJvZHVjdGlvblxuICAgICAgc2Fzc1BsdWdpbih7XG4gICAgICAgIC8vIFRoZXNlIHNldHRpbmdzIHNob3VsZCBtYXRjaCBidWlsZDpzdHlsZSBpbiBwYWNrYWdlLmpzb24gc29tZXdoYXRcbiAgICAgICAgc3R5bGU6IGlzRGV2ID8gJ2V4cGFuZGVkJyA6ICdjb21wcmVzc2VkJyxcbiAgICAgICAgbG9hZFBhdGhzOiBbJ25vZGVfbW9kdWxlcycsICdub2RlX21vZHVsZXMvYm9vdHN0cmFwL3Njc3MnLCAnbm9kZV9tb2R1bGVzL0BzdGF0aXN0aWNzbm9yd2F5J10sXG4gICAgICAgIGFzeW5jIHRyYW5zZm9ybShzb3VyY2UpIHtcbiAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lcnM6IHBvc3Rjc3MuQWNjZXB0ZWRQbHVnaW5bXSA9IFthdXRvcHJlZml4ZXJdXG4gICAgICAgICAgaWYgKCFpc0RldikgdHJhbnNmb3JtZXJzLnB1c2goY3NzbmFub1BsdWdpbilcblxuICAgICAgICAgIGNvbnN0IHsgY3NzIH0gPSBhd2FpdCBwb3N0Y3NzKHRyYW5zZm9ybWVycykucHJvY2Vzcyhzb3VyY2UpXG4gICAgICAgICAgcmV0dXJuIGNzc1xuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgXSxcbiAgICBsb2FkZXI6IHtcbiAgICAgICcuZXM2JzogJ2pzJyxcbiAgICB9LFxuICAgIG91dEV4dGVuc2lvbih7IGZvcm1hdCB9KSB7XG4gICAgICBpZiAoZm9ybWF0ID09PSAnaWlmZScpIHJldHVybiB7IGpzOiAnLmxlZ2FjeS5qcycgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAganM6ICcuanMnLFxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gQnkgZGVmYXVsdCB0c3VwIGJ1bmRsZXMgYWxsIGltcG9ydGVkIG1vZHVsZXMsIGJ1dCBkZXBlbmRlbmNpZXNcbiAgICAvLyBhbmQgcGVlckRlcGVuZGVuY2llcyBpbiB5b3VyIHBhY2thZ2VzLmpzb24gYXJlIGFsd2F5cyBleGNsdWRlZFxuICAgIGV4dGVybmFsOiBbXG4gICAgICAvLyBNdXN0IGJlIGxvYWRlZCBpbnRvIGdsb2JhbCBzY29wZSBpbnN0ZWFkXG4gICAgXSxcbiAgICBmb3JtYXQ6IFtcbiAgICAgICdpaWZlJywgLy8gRm9yIGJyb3dzZXJcbiAgICAgIC8vICdjanMnLCAvLyBMZWdhY3kgYnJvd3NlciBzdXBwb3J0XG4gICAgICAnZXNtJyxcbiAgICBdLFxuICAgIG1pbmlmeTogaXNEZXYgPyBmYWxzZSA6IHRydWUsXG5cbiAgICAvLyBUSVA6IENvbW1hbmQgdG8gY2hlY2sgaWYgdGhlcmUgYXJlIGFueSBiYWQgcmVxdWlyZXMgbGVmdCBiZWhpbmRcbiAgICAvLyBncmVwIC1yICdyZXF1aXJlKFwiJyBidWlsZC9yZXNvdXJjZXMvbWFpbiB8IGdyZXAgLXYgJ3JlcXVpcmUoXCIvJ3xncmVwIC12IGNodW5rXG4gICAgbm9FeHRlcm5hbDogWyd6aXBjZWx4JywgJ2Jvb3RzdHJhcC9qcy9kaXN0L2NvbGxhcHNlJ10sXG5cbiAgICB0YXJnZXQ6ICdlczIwMjAnLFxuXG4gICAgcGxhdGZvcm06ICdicm93c2VyJyxcbiAgICBzaWxlbnQ6IFsnUVVJRVQnLCAnV0FSTiddLmluY2x1ZGVzKHByb2Nlc3MuZW52LkxPR19MRVZFTF9GUk9NX0dSQURMRSB8fCAnJyksXG4gICAgc3BsaXR0aW5nOiB0cnVlLFxuICAgIHNvdXJjZW1hcDogaXNEZXYgPyBmYWxzZSA6IHRydWUsXG4gICAgdHNjb25maWc6IGAke0RJUl9TUkNfQVNTRVRTfS90c2NvbmZpZy5qc29uYCxcbiAgfVxufVxuIiwgImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL2pzdS9Eb2N1bWVudHMvU1NCL3JlcG8vbWltaXIvdHN1cC5jb25maWcudHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL1VzZXJzL2pzdS9Eb2N1bWVudHMvU1NCL3JlcG8vbWltaXJcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL1VzZXJzL2pzdS9Eb2N1bWVudHMvU1NCL3JlcG8vbWltaXIvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd0c3VwJ1xuaW1wb3J0IHsgdHlwZSBPcHRpb25zIH0gZnJvbSAnLi90c3VwJ1xuXG5pbXBvcnQgeyBESVJfRFNULCBESVJfRFNUX0FTU0VUUyB9IGZyb20gJy4vdHN1cC9jb25zdGFudHMnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygob3B0aW9uczogT3B0aW9ucykgPT4ge1xuICBpZiAob3B0aW9ucy5kID09PSBESVJfRFNUKSB7XG4gICAgcmV0dXJuIGltcG9ydCgnLi90c3VwL3NlcnZlcicpLnRoZW4oKG0pID0+IG0uZGVmYXVsdCgpKVxuICB9XG4gIGlmIChvcHRpb25zLmQgPT09IERJUl9EU1RfQVNTRVRTKSB7XG4gICAgcmV0dXJuIGltcG9ydCgnLi90c3VwL2NsaWVudC1hc3NldCcpLnRoZW4oKG0pID0+IG0uZGVmYXVsdCgpKVxuICB9XG4gIHRocm93IG5ldyBFcnJvcihgVW5jb25maWd1cmVkIGRpcmVjdG9yeTogJHtvcHRpb25zLmR9IWApXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7QUFBQSxJQUErUSxTQUNsUSxnQkFFQSxTQUNBO0FBSmI7QUFBQTtBQUF5USxJQUFNLFVBQVU7QUFDbFIsSUFBTSxpQkFBaUIsR0FBRyxPQUFPO0FBRWpDLElBQU0sVUFBVTtBQUNoQixJQUFNLGlCQUFpQixHQUFHLE9BQU87QUFBQTtBQUFBOzs7QUNKeEM7QUFBQTtBQUFBO0FBQUE7QUFBNFAsU0FBUyxnQkFBZ0I7QUFNdFEsU0FBUixvQkFBOEM7QUFDbkQsUUFBTSx5QkFBeUI7QUFDL0IsUUFBTSxlQUFlLFNBQVMsR0FBRyxPQUFPLFNBQVMsc0JBQXNCLElBQUk7QUFBQSxJQUN6RSxVQUFVO0FBQUEsSUFDVixRQUFRLENBQUMsR0FBRyxTQUFTLEdBQUcsY0FBYyxTQUFTLHNCQUFzQixF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
