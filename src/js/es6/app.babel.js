'use strict'

import curry from 'es5/helpers/curry'

let Shape = function () {
  if (!(this instanceof Shape)) {
    return new Shape(...arguments)
  }
  
  this.init(...arguments)
}

Shape.proto = Shape.prototype

Shape.proto.init = function (el, options) {
  // store canvas reference
  this.stage = el
  this.context = new MethodChain(this.stage.getContext('2d'))
  
  // store configuration with defaults
  this.options = Object.assign({
    pointCount: 6
  }, options)
  
  // store relevant size/position
  this.cacheMATHS()
  
  // set stage to fill the full of the window
  this.setStageSize()

  // functions that are wrapped in helper functions
  // lose their scope
  this.bindScope()
  
  return this
}

Shape.proto.bindScope = function () {
  this.getState = this.getState.bind(this)

  return this
}

Shape.proto.setStageSize = function () {
  this.stage.height = this.MATHS.clientHeight
  this.stage.width  = this.MATHS.clientWidth
  
  return this
}

Shape.proto.cacheMATHS = function () {
  let clientWidth  = document.body.clientWidth
    , clientHeight = document.body.clientHeight
    , centerX      = clientWidth / 2
    , centerY      = clientHeight / 2
    , radius       = Math.min(centerX, centerY) / 2
    , points       = []
  
    , _stepDist = (Math.PI * 2) / this.options.pointCount

  for (let point = 0; point < this.options.pointCount; point++) {
    points.push([
      centerX + radius * Math.cos(_stepDist * point * -1),
      centerY + radius * Math.sin(_stepDist * point * -1)
    ])
  }
  
  let [bx, by] = points[0]
    , [cx, cy] = points[1]
    , xDiff    = Math.abs(bx - cx)
    , yDiff    = Math.abs(by - cy)
    // a^2 = b^2 + c^2
    , distBetween = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff))
  
  
  let from = points[0]
    , center = points[1]
    , to = points[2]
    , fromRadians = getRadians(center, from)
    , toRadians = getRadians(center, to, {distBetween})
  // XXX
    , radiansBetween = Math.abs(toRadians - fromRadians) - fromRadians

  this.MATHS = {
    clientWidth,
    clientHeight,
    centerStage: {
      x: centerX,
      y: centerY,
    },
    radius,
    points,
    spaceBetweenPoints: distBetween,
    radiansBetween
  }

  return this
}

Shape.proto.drawPositions = function () {
  let { centerStage: { x, y }, points } = this.MATHS
  
  this.context
    .set('lineWidth', '1')
    .set('strokeStyle', '#666')
    .beginPath()
   
  points.forEach(point => {
    this.context
      .moveTo(x, y)
      .lineTo(...point)
  })
  
  this.context
    .closePath()
    .stroke()
  
  return this
}

Shape.proto.drawBackground = function () {
  let { clientWidth, clientHeight } = this.MATHS

  this.context
    .set('fillStyle', 'rgba(9, 9, 9, 0.15)')
    .fillRect(0, 0, clientWidth, clientHeight)

  return this
}

Shape.proto.drawDebug = function (state) {
  let { spaceBetweenPoints: r, radiansBetween, points } = this.MATHS
  
  if (!state) {
    state = this.getState()
  }
  
  points.forEach( (point, key) => {
      this.context
        // unmoved path
        .beginPath()
        // .set('strokeStyle', '#DEFACE') 
        // .moveTo(...state.pivot)
        // .lineTo(...state.to)
        // .moveTo(...state.pivot)
        // .lineTo(...state.from)
        // .stroke()
        // debugging
        .set('strokeStyle', '#fe11a5') 
        .beginPath()
        .arc(...point, r, 0, 2 * Math.PI)
        .closePath()
        .stroke()
  })

  // this.context
  //   // unmoved path
  //   .beginPath()
  //   .set('strokeStyle', '#DEFACE') 
  //   .moveTo(...state.pivot)
  //   .lineTo(...state.to)
  //   .moveTo(...state.pivot)
  //   .lineTo(...state.from)
  //   .stroke()
  //   // debugging
  //   .set('strokeStyle', '#fe11a5') 
  //   .beginPath()
  //   .arc(...state.pivot, r, 0, 2 * Math.PI)
  //   .closePath()
  //   .stroke()

  return this
}





Shape.proto.drawLine = function (state, counter) {
    // let { pivot, from, to, percent } = opts
  let { spaceBetweenPoints: r, radiansBetween } = this.MATHS
    , { pivot, from } = state
    , [ pivotx, pivoty ] = pivot
    , fromRadians = getRadians(pivot, from)
    // , toRadians   = getRadians(pivot, to)
    , radiansDiff = radiansBetween * counter
    
  if (counter >= 1) {
    radiansDiff = 0
  }

  let _endPoint = [
    // next steps: from res and to res should be on expexted lines
    pivotx + r * Math.cos(fromRadians + radiansDiff),
    pivoty + r * Math.sin(fromRadians + radiansDiff)
  ]

  this.context
    .set('strokeStyle', '#FEEB1E')
    .beginPath()
    .moveTo(...state.pivot)
    .lineTo(..._endPoint)
    .closePath()
    .stroke()

  return this
}





Shape.proto.getState = cache(function (counter, prev) {
  let { index: prevIndex } = prev || { index: 2 }
    , { points } = this.MATHS
    , indexOverflow = curry((mod, i) => {
        return i % mod
      }, this.options.pointCount)
    , pointsOverflow = curry((arr, i) => {
        return arr[indexOverflow(i)]
      }, points)
    , index = indexOverflow(prevIndex + 1)
    , pivot = pointsOverflow(index + 1)
    , from  = pointsOverflow(index)
    , to    = pointsOverflow(index + 2)
  
  this.resetCounter()

  return {
    index,
    pivot,
    from,
    to
  }
}, function (counter, prev) {
  return !prev || counter >= 1
})


Shape.proto.resetCounter = function () {
  this.__counter = 0
  return this
}

Shape.proto.getAndIncreaseCounter = function (inc) {
  if (!(typeof this.__counter === 'number')) {
    this.__counter = 0
  }
  
  console.log(inc)

  this.__counter = toHundredth(this.__counter + (inc || 0.01))

  return this.__counter
}




Shape.proto.startCrawl = function () {
  let _loop = (inc) => {
    let counter = this.getAndIncreaseCounter(inc)
      , state = this.getState(counter)

    // console.log('looped', state)
  
    this.drawBackground()
    this.drawPositions()
    this.drawDebug(state)
    this.drawLine(state, counter)
    
    if (this.__allowDraw) {
      requestAnimationFrame(_loop)
    }
  }
  
  this.__allowDraw = true
  
  this.stage.addEventListener('click', curry(_loop, .1))
  
  // _loop()
  
  this.drawBackground()
  this.drawPositions()
  this.drawDebug()  
  
  return this
}

Shape.proto.stopCrawl = function () {
  this.__allowDraw = false
  
  return this
}


// **********************************

let noNaN = (val) => {
  if (Number.isNaN(val)) {
    console.log('got NaN')
  }
  return Number.isNaN(val) ? 0 : val
}

// get the amount of radians from 0
// to the given point on a circle
let getRadians = (center, point, debug) => {
  let [cx, cy] = center
    , [px, py] = point
    , opposite = Math.abs(cy - py)
    , adjacent = Math.abs(cx - px)
    , res

  if (py >= cy) { // below center point

    if (px >= cx) { // right of center point
      res = noNaN(Math.atan(opposite / adjacent))
    } else { // left of center point
      res = Math.PI - noNaN(Math.atan(opposite / adjacent))
    }

  } else { // about center point
    // let opposite = Math.abs(cy - py)
    //   , adjacent = Math.abs(cx - px)
    
    if (px >= cx) { // right of center point
      res = Math.PI * 1.5 + noNaN(Math.asin(opposite / adjacent))
    } else { // left of center point
      res = Math.PI + noNaN(Math.sin(opposite / adjacent))
      
      // if (debug) {
      //   setTimeout(() => {      
      //     shape.context
      //       .set('fillStyle', '#1A66ED')
      //       .fillRect(...center, 5, 5)
      //       .set('fillStyle', '#1A66ED')
      //       .fillRect(...point, 5, 5)
      //       .beginPath()
      //       .arc(...center, debug.distBetween, 0, Math.sin(opposite / adjacent) + Math.PI)
      //       .stroke()
      //       .closePath()
      //   }, 500)
      // }
    }
  }

  return res
}

function toHundredth (number) {
  return Math.round(number * 100) / 100
}

function cache (fn, buster) {
  let res = null

  return function (...args) {
    if (buster.call(this, ...args, res)) {
      res = fn.call(this, ...args, res)
    }
    
    return res
  }
}

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


// **************************


let shape = new Shape(document.querySelector('#hex'), {})

shape.startCrawl()
  .stopCrawl()