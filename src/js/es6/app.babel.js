'use strict'

import CONFIG from 'es5/config'

import curry from 'es5/helpers/curry'
import cache from 'es5/helpers/cache'
import MethodChain from 'es5/helpers/MethodChain'
import { toHundredth, noNaN, getRadians } from 'es5/helpers/math'
import { default as __counter } from 'es5/helpers/counter'

let Shape = function () {
  if (!(this instanceof Shape)) {
    return new Shape(...arguments)
  }
  
  this.init(...arguments)
}

Shape.proto = Shape.prototype

Shape.proto.init = function (el, options) {
	// set up private counter
	__counter(this).config({
		increment: CONFIG.COUNTER_INCREMENT,
		incrementFn: (value, inc) => {
			return toHundredth(value + inc)
		}
	})

  // store canvas reference
  this.stage = el
  this.context = new MethodChain(this.stage.getContext('2d'))
  
  // store configuration with defaults
  this.options = Object.assign({
    pointCount: CONFIG.POINT_COUNT
  }, options)
  
  // store relevant size/position
  this.cacheMATHS()
  
  // set stage to fill the full of the window
  this.setStageSize()

  // functions that are wrapped in helper functions
  // lose their scope
  this.bindScope()

  // bind canvas-related events
  this.bindEvents()
  
  return this
}

Shape.proto.bindScope = function () {
  this.getState = this.getState.bind(this)

  return this
}

Shape.proto.bindEvents = function () {

	window.addEventListener('resize', () => {
		let wasDrawing = this.__allowDraw
		if (wasDrawing) this.stopCrawl()

		this.setStageSize()
				.cacheMATHS()
				.startCrawl()

		if (!wasDrawing) this.stopCrawl()
	})
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

Shape.proto.drawDebug = function (state, counter) {
	// console.log('drawDebug');

	let { spaceBetweenPoints: r, radiansBetween } = this.MATHS
    , { pivot, from } = state
    , [ pivotx, pivoty ] = pivot
    , fromRadians = getRadians(pivot, from)
    , radiansDiff = radiansBetween * counter

    
  this.context
    .set('strokeStyle', '#DA66A5')
    .beginPath()
    .arc(...pivot, r, 0, radiansBetween)
    .stroke()
    .closePath()

  return this

  return this
}





Shape.proto.drawLine = function (state, counter) {
    // let { pivot, from, to, percent } = opts
  let { spaceBetweenPoints: r, radiansBetween } = this.MATHS
    , { pivot, from } = state
    , [ pivotx, pivoty ] = pivot
    // , fromRadians = getRadians(pivot, from, {
    // 		context: this.context
	   //  })
    , fromRadians = getRadians(pivot, from)
    // , toRadians   = getRadians(pivot, to)
    , radiansDiff = radiansBetween * counter

  console.log(radiansBetween, counter, radiansDiff);
    
  if (counter >= 1) {
    radiansDiff = 0
  }

  // console.log(state);

  let _endPoint = [
    // next steps: from res and to res should be on expexted lines
    pivotx + r * Math.cos(fromRadians + radiansDiff),
    pivoty + r * Math.sin(fromRadians + radiansDiff)
  ]

  this.context
    .set('strokeStyle', '#FEEB1E')
    .beginPath()
    .moveTo(...pivot)
    .lineTo(..._endPoint)
    .closePath()
    .stroke()

  return this
}





Shape.proto.getState = cache(function (counter, prev) {
  let { index: prevIndex } = prev || { index: CONFIG.STATE_INDEX }
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
  
  __counter(this).reset()

  return {
    index,
    pivot,
    from,
    to
  }
}, (counter, prev, __force) => {
	return counter >= 1
})

Shape.proto.startCrawl = function () {
  let _loop = (inc) => {
    let counter = __counter(this).increment()
      , state   = this.getState(counter)

    this.drawBackground()
    // this.drawPositions()
    this.drawDebug(state, counter)
    this.drawLine(state, counter)
    
    if (this.__allowDraw) {
      requestAnimationFrame(_loop)
    }
  }
  
  this.__allowDraw = true
  
  _loop()
    
  return this
}

Shape.proto.stopCrawl = function () {
  this.__allowDraw = false
  
  return this
}

export default Shape