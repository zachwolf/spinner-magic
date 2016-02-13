requirejs(['es5/app'], function (Shape) {
  var shape = new Shape.default(document.querySelector('#hex'), {})

  shape.startCrawl()
    .stopCrawl()
})