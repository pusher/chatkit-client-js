import {
  contains,
  filter,
  join,
  map,
  pipe,
  toPairs,
} from "ramda"

export const urlEncode = pipe<any, any, any, any, any>(
  filter(x => x !== undefined),
  toPairs,
  map(([k, v]) => `${k}=${encodeURIComponent(v)}`),
  join("&"),
)

export const appendQueryParams = (queryParams: any, url: string) => {
  const separator = contains("?", url) ? "&" : "?"
  return url + separator + urlEncode(queryParams)
}

export const appendQueryParamsAsArray = (key: string, values: any[], url: string) => {
  const separator = contains("?", url) ? "" : "?"
  const encodedPairs = map(
    v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`,
    values,
  )
  return url + separator + join("&", encodedPairs)
}

export const unixSeconds = () => Math.floor(Date.now() / 1000)
