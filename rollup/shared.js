import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import json from 'rollup-plugin-json'

const pusherPlatformExports = [
  'BaseClient',
  'HOST_BASE',
  'Instance',
  'sendRawRequest'
]

export default {
  input: 'src/main.js',
  plugins: [
    json(),
    babel({
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
        'node_modules/pusher-platform/dist/web/pusher-platform.js':
          pusherPlatformExports,
        'node_modules/pusher-platform/react-native.js': pusherPlatformExports
      }
    }),
    uglify()
  ]
}
