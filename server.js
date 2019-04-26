const app = require('./app');

// Listens on recommended port with default of 8090
const server = app.listen(process.env.PORT || 8080, () => {
	console.log('> Listening on port ' + (process.env.PORT || 8080));
});

process.on('SIGINT', () => {
	console.log();
	console.log('Closing HTTP server.');
	server.close(() => {
		console.log('HTTP server closed.');
		process.exit(0);
	});
});
