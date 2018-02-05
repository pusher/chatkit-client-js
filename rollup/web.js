import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/web/chatkit.js',
    format: 'umd',
    name: 'Chatkit'
  },
  plugins: [
    babel({
      babelrc: false,
      presets: [
        [
          'env',
          {
            modules: false
          }
        ]
      ],
      plugins: [
        'external-helpers',
        'transform-class-properties',
        'transform-object-rest-spread'
      ],
      exclude: [
        'node_modules/**'
      ]
    }),
    resolve(),
    commonjs({
      namedExports: {
        'node_modules/pusher-platform/dist/web/pusher-platform.js': [
          'BaseClient',
          'HOST_BASE',
          'Instance',
          'sendRawRequest'
        ]
      }
    })
  ]
}
