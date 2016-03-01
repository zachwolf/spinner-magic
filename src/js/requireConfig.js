requirejs(['es5/app', 'es5/helpers/counter'], function (Shape, counter) {
  var shape = new Shape.default(document.querySelector('#hex'), {})

  shape.startCrawl()
    .stopCrawl()

  document.body.addEventListener('mousedown', () => {
  	console.log(counter.default(shape).value);
  	shape.startCrawl()
  })

  document.body.addEventListener('mouseup', () => {
  	shape.stopCrawl()
  })

  // setTimeout(() => {
  // 	shape.stopCrawl()
  // }, 5000)
})