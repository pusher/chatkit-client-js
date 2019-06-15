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
  map(([k, v]) => `${k}=${encodeURIComponent(v as string | number | boolean)}`),
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
