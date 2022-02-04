import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from 'rollup-plugin-replace';
import autoExternal from 'rollup-plugin-auto-external';
import alias from '@rollup/plugin-alias';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/rtv-client-esm.js',
    format: 'es',
  },
  plugins: [
    alias({
      entries: [{ find: './api/app', replacement: './api/app.browser' }],
    }),
    replace({
      IS_BROWSER: true,
      'process.env.npm_package_version': `"${process.env.npm_package_version}"`,
    }),
    typescript({ declaration: false }),
    resolve(),
    json(),
    commonjs(),
    autoExternal(),
  ],
};
