// Set the base bath for absolute imports/requires:
// tslint:disable-next-line:no-var-requires
void require('app-module-path').addPath(__dirname + '/../');

import { readdirSync } from 'fs';
import { Route } from 'lib/server/Route';
import * as express from 'express';
import { Express } from 'express-serve-static-core';

// START THE APP:
// Find the function implementation further below.
main();

/**
 * Main app entry point.
 */
async function main(hostname = '0.0.0.0', port = 8080) {
	setupErrorHandlers();

	// import all routes
	await importRoutes();

	// start the express server, then bind routes to it
	const app = createAndConfigureExpressApp();
	Route.registerRoutesInExpressApp(app);
	app.listen(port, hostname);

	console.log(`server listening to http://${hostname}:${port}`);
}

/**
 * Registers global handlers for node.js' uncaught error and unhandled rejection events.
 */
function setupErrorHandlers(): void {
	// tslint:disable:no-console

	process.on('uncaughtException', error => {
		console.warn('UNCAUGHT EXCEPTION:');
		console.warn(error);
		process.exit();
	});

	process.on('unhandledRejection', error => {
		console.warn('UNHANDLED REJECTION:');
		console.warn(error);
		process.exit();
	});

	// tslint:enable:no-console
}

/**
 * Imports all route files. Since routes register themselves, there's no need to
 * do anything with the imported files.
 */
async function importRoutes() {
	const dirPath = `${__dirname}/routes/`;

	readdirSync(dirPath)
		.filter(fileName => /.*.ts$/.test(fileName))
		.forEach(fileName => import(`${dirPath}/${fileName}`));
}

/**
 * Creates an express app instance and adds configuration and middleware to it.
 */
function createAndConfigureExpressApp(): Express {
	const app = express();

	// Set up static file serving:
	app.use(express.static(`${__dirname}/static/`));

	// Set up EJS rendering:
	app.engine('ejs', require('ejs-locals'));
	app.set('view engine', 'ejs');
	app.set('views', `${__dirname}/templates/`);

	// Set up HTTP body parser:
	const bodyParser = require('body-parser');
	app.use(bodyParser.text({ type: 'text/plain' }));

	// ------------------------------ //
	// - add middleware here if any - //
	// ------------------------------ //

	return app;
}
