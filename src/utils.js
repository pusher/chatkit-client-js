import {
  filter,
  forEachObjIndexed,
  join,
  map,
  pipe,
  split,
  toPairs
} from 'ramda'

// urlEncode :: Object -> String
export const urlEncode = pipe(
  filter(x => x !== undefined),
  toPairs,
  map(([k, v]) => `${k}=${encodeURIComponent(v)}`),
  join('&')
)

// appendQueryParam :: String -> String -> String -> String
export const appendQueryParam = (key, value, url) => {
  const [ before, after ] = split('?', url)
  return before + '?' + (after ? after + '&' : '') + urlEncode({ [key]: value })
}

export const typeCheck = (name, expectedType, value) => {
  const type = typeof value
  if (type !== expectedType) {
    throw new TypeError(
      `expected ${name} to be of type ${expectedType} but was of type ${type}`
    )
  }
}

// checks that all of an objects values are of the given type
export const typeCheckObj = (expectedType, obj) => forEachObjIndexed(
  (value, key) => typeCheck(key, expectedType, value),
  obj
)

// pointfree debugging
export const trace = msg => x => {
  console.log(msg, x)
  return x
}
