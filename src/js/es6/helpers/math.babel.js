import MethodChain from 'es5/helpers/methodChain'
import { get } from 'es5/helpers/object'

export function toHundredth(number) {
  if (Math.abs(number) < 0.01 && Math.abs(number) > 0) {
    console.warn('`toHundredth` is not intended for numbers less than +-.01')
  }
  return Math.round(number * 100) / 100
}

export let noNaN = (val) => {
  if (Number.isNaN(val)) {
    console.log('got NaN')
  }
  return Number.isNaN(val) ? 0 : val
}

export let getHypotenuseLength = (from, to) => {
  let [fx, fy] = from
    , [tx, ty] = to
    , rise = Math.abs(fy - ty)
    , run  = Math.abs(fx - tx)

  return Math.sqrt((rise * rise) + (run * run))
}

// get the amount of radians from 0
// to the given point on a circle
export let getRadians = (center, point, debug) => {

  let [cx, cy] = center
    , [px, py] = point
    , opposite = Math.abs(cy - py)
    , adjacent = Math.abs(cx - px)
    , res

  let context = get(debug, 'context', false)

  if (py >= cy) { // below center point
    if (px >= cx) { // right of center point
      res = noNaN(Math.atan(opposite / adjacent))
    } else { // left of center point
      res = Math.PI - noNaN(Math.atan(opposite / adjacent))
    }
  } else { // about center point
    if (px >= cx) { // right of center point
      res = Math.PI * 2 - noNaN(Math.atan(opposite / adjacent))
    } else { // left of center point
      res = Math.PI + noNaN(Math.atan(opposite / adjacent))
    }
  }

  if (context) {

    context
      // .set('strokeStyle', '#c0ffee')
      // .beginPath()
      // .moveTo(...center)
      // .lineTo(...point)
      // .closePath()
      // .stroke()

      .set('strokeStyle', '#beeeef')
      .beginPath()
      .moveTo(...center)
      // .arc(...center, getHypotenuseLength(center, point), res, Math.PI)
      .arc(...center, getHypotenuseLength(center, point), res, Math.PI)
      .stroke()
      .closePath()
  }

  return res
}