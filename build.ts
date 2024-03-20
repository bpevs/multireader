import type { Format } from 'npm:esbuild'
import * as esbuild from 'npm:esbuild'
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader@0.9.0'
import { resolve } from 'jsr:@std/path@0.215.0'
import { solidPlugin } from 'npm:esbuild-plugin-solid'

const [denoResolver, denoLoader] = [...denoPlugins({
  nodeModulesDir: true,
  importMapURL: 'file://' + resolve('./import_map.json'),
})]

const options = {
  plugins: [
    denoResolver,
    solidPlugin({ solid: { moduleName: 'npm:solid-js/web' } }),
    denoLoader,
  ],
  entryPoints: [
    { in: './src-www/index.tsx', out: './index' },
    { in: './src-www/preload.ts', out: './preload' }
  ],
  outdir: './src-www/dist',
  bundle: true,
  platform: 'browser',
  format: 'esm' as Format,
  treeShaking: true
}

if (Deno.args[0] === 'build') {
  await esbuild.build(options)
  esbuild.stop()
} else if (Deno.args[0] === 'dev') {
  let ctx = await esbuild.context(options)

  let { host, port } = await ctx.serve({
    servedir: 'src-www',
    port: 3000
  })
}
