import { merge } from 'ramda'
import alias from 'rollup-plugin-alias'
import path from 'path'

import shared from './shared'

export default merge(shared, {
  output: {
    file: 'dist/react-native/chatkit.js',
    format: 'cjs',
    name: 'Chatkit'
  },
  plugins: [
    alias({
      'pusher-platform': path.resolve(
        './node_modules/pusher-platform/react-native.js'
      )
    }),
    ...shared.plugins
  ]
})
