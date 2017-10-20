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

export function allPromisesSettled(promises) {
  return Promise.all(promises.map(p => Promise.resolve(p).then(v => ({
    state: 'fulfilled',
    value: v,
  }), r => ({
    state: 'rejected',
    reason: r,
  }))));
}
