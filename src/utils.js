import {
  contains,
  filter,
  forEachObjIndexed,
  join,
  map,
  pipe,
  toPairs,
} from "ramda"

export const urlEncode = pipe(
  filter(x => x !== undefined),
  toPairs,
  map(([k, v]) => `${k}=${encodeURIComponent(v)}`),
  join("&"),
)

export const appendQueryParams = (queryParams, url) => {
  const separator = contains("?", url) ? "&" : "?"
  return url + separator + urlEncode(queryParams)
}

export const appendQueryParamsAsArray = (key, values, url) => {
  const separator = contains("?", url) ? "" : "?"
  const encodedPairs = map(
    v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`,
    values,
  )
  return url + separator + join("&", encodedPairs)
}

export const typeCheck = (name, expectedType, value) => {
  const type = typeof value
  if (type !== expectedType) {
    throw new TypeError(
      `expected ${name} to be of type ${expectedType} but was of type ${type}`,
    )
  }
}

// checks that value is a string or function
export const typeCheckStringOrFunction = (name, value) => {
  const type = typeof value
  if (type !== "string" && type !== "function") {
    throw new TypeError(
      `expected ${name} to be a string or function but was of type ${type}`,
    )
  }
}

// checks that value is an object or function
export const typeCheckObjectOrFunction = (name, value) => {
  const type = typeof value
  if (type !== "object" && type !== "function") {
    throw new TypeError(
      `expected ${name} to be an object or function but was of type ${type}`,
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
  typeCheck(name, "object", obj)
  forEachObjIndexed(
    (value, key) => typeCheck(`${name}.${key}`, expectedType, value),
    obj,
  )
}

export const checkOneOf = (name, values, value) => {
  if (!contains(value, values)) {
    throw new TypeError(
      `expected ${name} to be one of ${values} but was ${value}`,
    )
  }
}

export const unixSeconds = () => Math.floor(Date.now() / 1000)
