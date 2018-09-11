export default (fn, prop): boolean => {
  while (typeof fn === 'function' && fn.prototype) {
    if (fn.prototype.hasOwnProperty(prop)) {
      return true
    }
    fn = getPrototypeOf(fn)
  }
  return false
}

function getPrototypeOf(obj) {
  if (obj == null) return null
  return Object.getPrototypeOf(Object(obj))
}
