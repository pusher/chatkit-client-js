export function urlEncode(data) {
  return Object.keys(data)
    .filter(key => data[key] !== undefined)
    .map(key => `${ key }=${ encodeURIComponent(data[key]) }`)
    .join("&");
}

export function queryString(data) {
  const encodedData = urlEncode(data);
  return encodedData ? `?${ encodedData }` : "";
}
