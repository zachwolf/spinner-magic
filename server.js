var Promise = require('bluebird')
	, fs      = require('fs')
	, path    = require('path')
	, babel   = Promise.promisifyAll(require('babel-core'))
	, through = require('through2')
	, express = require('express')
	, app     = express()

app.set('view engine', 'ejs')
app.set('views', 'src/templates')

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/js/es5/:filename', (req, res) => {
	var file = path.join(__dirname, 'src', 'js', 'es6', req.params.filename.replace(/^(.+)\.js$/, '$1.babel.js'))

	fs.stat(file, (err, stat) => {
		if (err) {
			console.log(`Error reading ${req.params.filename}`)
			console.log(err)
			res.status(500)
			return res.json({
				error: 'Unable to find file'
			})
		}
		
		babel.transformFileAsync(file)
			.then((compiled) => {
				res.send(compiled.code)
			})
	})
})

app.use(express.static('src'))

app.listen(3456, () => {
	console.log('listening on 3456')
})