var Promise    = require('bluebird')
	, fs         = Promise.promisifyAll(require('fs'))
	, babel      = Promise.promisifyAll(require('babel-core'))
	, path       = require('path')
	, express    = require('express')
	, app        = Promise.promisifyAll(express())
	, livereload = require('livereload')

app.set('view engine', 'ejs')
app.set('views', 'src/templates')

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/js/es5/(:dirs*/)?:filename\.js', (req, res) => {
	var file = path.join(__dirname, 'src', 'js', 'es6', req.params.dirs ? req.params.dirs : '', req.params.filename + '.babel.js')

	fs.statAsync(file)
		.then(() => {
			babel.transformFileAsync(file)
				.then((compiled) => {
					res.send(compiled.code)
				})
		})
		.catch((err, stat) => {
			if (err) {
				console.log(`Error reading ${req.params.filename}`)
				console.log(err)
				res.status(500)
				return res.json({
					error: 'Unable to find file'
				})
			}
		})
})

app.use('/lib', express.static('node_modules'))

app.use(express.static('src'))

console.log(app._router.stack)

app.listenAsync(3456)
	.then(() => console.log('listening on 3456'))
	.then(() => {
		server = livereload.createServer()
		server.watch(__dirname + "/src")
		console.log('livereload server listening')
	})