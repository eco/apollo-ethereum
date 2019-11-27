import autoExternal from 'rollup-plugin-auto-external'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const plugins = [
  autoExternal(),
  resolve(),
  commonjs(),
]

export default [
  {
    input: 'src/cli',
    output: {
      file: 'lib/cli.js',
      format: 'cjs'
    },
    plugins,
  },
  {
    input: 'src/link',
    output: {
      file: 'lib/link.js',
      format: 'cjs'
    },
    plugins,
  }
]
