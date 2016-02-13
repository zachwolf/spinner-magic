export function toHundredth(number) {
  return Math.round(number * 100) / 100
}

export let noNaN = (val) => {
  if (Number.isNaN(val)) {
    console.log('got NaN')
  }
  return Number.isNaN(val) ? 0 : val
}

// get the amount of radians from 0
// to the given point on a circle
export let getRadians = (center, point, debug) => {
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