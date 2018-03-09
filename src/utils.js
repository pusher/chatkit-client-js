import {
  contains,
  filter,
  forEachObjIndexed,
  fromPairs,
  join,
  map,
  pipe,
  split,
  toPairs
} from 'ramda'

export const urlEncode = pipe(
  filter(x => x !== undefined),
  toPairs,
  map(([k, v]) => `${k}=${encodeURIComponent(v)}`),
  join('&')
)

export const appendQueryParams = (queryParams, url) => {
  const separator = contains('?', url) ? '&' : '?'
  return url + separator + urlEncode(queryParams)
}

export const extractQueryParams = url =>
  contains('?', url) ? queryStringToObj(split('?', url)[1]) : {}

const queryStringToObj = pipe(split('&'), map(split('=')), fromPairs)

export const typeCheck = (name, expectedType, value) => {
  const type = typeof value
  if (type !== expectedType) {
    throw new TypeError(
      `expected ${name} to be of type ${expectedType} but was of type ${type}`
    )
  }
}

// checks that all of an arrays elements are of the given type
export const typeCheckArr = (name, expectedType, arr) => {
  if (!Array.isArray(arr)) {
    throw new TypeError(`expected ${name} to be an array`)
  }
  arr.forEach((value, i) => typeCheck(`${name}[${i}]`, expectedType, value))
}

// checks that all of an objects values are of the given type
export const typeCheckObj = (name, expectedType, obj) => {
  typeCheck(name, 'object', obj)
  forEachObjIndexed((value, key) => typeCheck(key, expectedType, value), obj)
}

export const checkOneOf = (name, values, value) => {
  if (!contains(value, values)) {
    throw new TypeError(
      `expected ${name} to be one of ${values} but was ${value}`
    )
  }
}

export const unixSeconds = () => Math.floor(Date.now() / 1000)

// pointfree debugging
export const trace = msg => x => {
  console.log(msg, x)
  return x
}
