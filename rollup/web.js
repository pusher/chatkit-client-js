import { merge } from 'ramda'

import shared from './shared'

export default merge(shared, {
  output: {
    file: 'dist/web/chatkit.js',
    format: 'umd',
    name: 'Chatkit'
  }
})
