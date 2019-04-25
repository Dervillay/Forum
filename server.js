const app = require('./app');

// Listens on recommended port with default of 8090
app.listen(process.env.PORT || 8090, () => {
	console.log('> Listening on port ' + (process.env.PORT || 8090));
});
