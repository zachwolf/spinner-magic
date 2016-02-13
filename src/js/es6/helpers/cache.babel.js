export default function (fn, buster) {
  let res = null

  return function (...args) {
    if (buster.call(this, ...args, res)) {
      res = fn.call(this, ...args, res)
    }
    
    return res
  }
}