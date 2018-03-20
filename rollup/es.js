import { merge } from 'ramda'

import shared from './shared'

export default merge(shared, {
  output: {
    file: 'dist/es/chatkit.js',
    format: 'es',
    name: 'Chatkit'
  }
})
