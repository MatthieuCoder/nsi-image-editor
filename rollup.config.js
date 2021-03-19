import typescript from '@rollup/plugin-typescript'
import { uglify } from 'rollup-plugin-uglify'
import { string } from 'rollup-plugin-string'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'public/js',
    format: 'cjs'
  },
  plugins: [
    string({
      include: '**/*.glsl'
    }),
    typescript(),
    uglify()
  ]
}
