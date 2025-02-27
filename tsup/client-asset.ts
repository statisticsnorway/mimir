import { globSync } from 'glob'
import { sassPlugin } from 'esbuild-sass-plugin'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import cssnanoPlugin from 'cssnano'
// import { print } from 'q-i';
import { DIR_SRC_ASSETS } from './constants'
import { type Options } from '.'

export default function buildAssetConfig(): Options {
  const isDev = process.env.NODE_ENV === 'development'
  const SCRIPT_GLOB_EXTENSIONS_ASSETS = '{tsx,ts,jsx,js,es6}'

  // Use object entry to force flat output folder structure, object key is destination path
  const SCRIPT_FILES_ASSETS = globSync(`${DIR_SRC_ASSETS}/**/*.${SCRIPT_GLOB_EXTENSIONS_ASSETS}`)
    .map((s) => s.replaceAll('\\', '/'))
    .reduce((acc, path) => {
      const fileName = path.split('/').pop()
      if (!fileName) {
        acc[path] = path
      } else {
        acc[`js/${fileName.split('.')[0]}`] = path
      }
      return acc
    }, {})

  // Not using glob for styles, because we want to bundle them
  const STYLE_FILES_ASSETS = {
    'styles/bundle': `${DIR_SRC_ASSETS}/styles/main.scss`,
    'styles/bundle_menu': `${DIR_SRC_ASSETS}/styles/main_menu.scss`,
  }

  // print(FILES_ASSETS, { maxItems: Infinity });
  return {
    bundle: true,
    dts: false, // d.ts files are use useless at runtime
    entry: { ...SCRIPT_FILES_ASSETS, ...STYLE_FILES_ASSETS },
    esbuildPlugins: [
      // TSUP/Esbuild plugins don't have a great watching mechanism, so we use sass cli for that
      // We keep the sassPlugin for autoprefixer and cssnano used when building for production
      sassPlugin({
        // These settings should match build:style in package.json somewhat
        style: isDev ? 'expanded' : 'compressed',
        loadPaths: ['node_modules', 'node_modules/bootstrap/scss', 'node_modules/@statisticsnorway'],
        async transform(source) {
          const transformers: postcss.AcceptedPlugin[] = [autoprefixer]
          if (!isDev) transformers.push(cssnanoPlugin)

          const { css } = await postcss(transformers).process(source)
          return css
        },
      }),
    ],
    loader: {
      '.es6': 'js',
    },
    outExtension({ format }) {
      if (format === 'iife') return { js: '.legacy.js' }
      return {
        js: '.js',
      }
    },
    // By default tsup bundles all imported modules, but dependencies
    // and peerDependencies in your packages.json are always excluded
    external: [
      // Must be loaded into global scope instead
    ],
    format: [
      'iife', // For browser
      // 'cjs', // Legacy browser support
      'esm',
    ],
    minify: isDev ? false : true,

    // TIP: Command to check if there are any bad requires left behind
    // grep -r 'require("' build/resources/main | grep -v 'require("/'|grep -v chunk
    noExternal: ['zipcelx', 'bootstrap/js/dist/collapse'],

    target: 'es2020',

    platform: 'browser',
    silent: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE || ''),
    splitting: true,
    sourcemap: isDev ? false : true,
    tsconfig: `${DIR_SRC_ASSETS}/tsconfig.json`,
  }
}
