function MethodChain (obj) {
  if (!(this instanceof MethodChain)) {
    return new MethodChain(...arguments)
  }
  
  this.obj = obj
  
  for (let method in obj) {
    if (typeof obj[method] === 'function') {
      this[method] = (...args) => {
        this.obj[method](...args)
        return this
      }
    }
  }
}

MethodChain.prototype.set = function (prop, val) {
  this.obj[prop] = val
  return this
}

export default MethodChain