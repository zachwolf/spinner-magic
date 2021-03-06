// todo: if no `buster` passed, only run once
export default function (fn, buster) {
  let res = null

  return function (...args) {

    if (!res || buster.call(this, ...args, res)) {
      res = fn.call(this, ...args, res)
    }
    
    return res
  }
}