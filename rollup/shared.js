import babel from "rollup-plugin-babel"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"
import uglify from "rollup-plugin-uglify"
import json from "rollup-plugin-json"
import typescript from "rollup-plugin-typescript"

const pusherPlatformExports = [
  "BaseClient",
  "HOST_BASE",
  "Instance",
  "sendRawRequest",
]

export default {
  input: "src/main.ts",
  plugins: [
    json(),
    resolve(),
    typescript({tsconfig: "tsconfig.json"}),
    commonjs({
      namedExports: {
        "node_modules/@pusher/platform/dist/web/pusher-platform.js": pusherPlatformExports,
        "node_modules/@pusher/platform/react-native.js": pusherPlatformExports,
      },
      extensions: ['.js', '.ts'],
    }),
    uglify(),
  ],
}
