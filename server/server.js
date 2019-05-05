/**
 * Functions to initialize and start the server.
 *
 * @namespace server
 * @memberof server
 */

const express = require('express');
const PouchDB = require('pouchdb');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const {
	documentGet,
	documentPut,
	documentDelete,
	documentPost,
	getAllCropRelationships,
	getCropsByName,
	getLocations,
	getUpdates,
	login
} = require('./middleware');
const Crop = require('./models/crop');
const CropRelationship = require('./models/crop-relationship');
const CropTag = require('./models/crop-tag');
const Location = require('./models/location');
const User = require('./models/user');
const {
	PP_PORT
} = require('../secrets.js');
const { getDatabaseURL, isDevelopmentMode } = require('./utils');

/**
 * Build router for a document API.
 *
 * @param {Model} model
 * @return {Router}
 */
function buildDocumentApiRouter(model) {
	const router = express.Router();

	router.route('/').post((req, res, next) => {
		documentPost(req, res, next, model);
	});
	router.route('/:id').get((req, res, next) => {
		documentGet(req, res, next, model);
	});
	if (model != User) {
		router
			.route('/:id')
			.put((req, res, next) => {
				documentPut(req, res, next, model);
			})
			.delete((req, res, next) => {
				documentDelete(req, res, next, model);
			});
	}

	return router;
}

/**
 * Build router for the API.
 *
 * @return {Router}
 */
function buildApiRouter() {
	const router = express.Router();

	/*
	 * Adding headers to allow cross-origin requests. This means it's a publicly
	 * available API!
	 */
	router.all('*', (req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
		next();
	});

	/*
	 * API document points that allow the low-level editing of database documents.
	 */
	router.use('/crops', buildDocumentApiRouter(Crop));
	router.use('/crop-relationships', buildDocumentApiRouter(CropRelationship));
	router.use('/crop-tags', buildDocumentApiRouter(CropTag));
	router.use('/users', buildDocumentApiRouter(User));
	router.use('/locations', buildDocumentApiRouter(Location));

	/*
	 * API function points for more complex calculations.
	 */
	router.post('/login', login);
	router.get('/get-crops-by-name', getCropsByName);
	router.get('/get-all-crop-relationships', getAllCropRelationships);
	router.get('/get-locations', getLocations);
	router.post('/get-updates', getUpdates);

	router.get('*', (req, res, next) => {
		next({ status: 404, message: 'No such route' });
	});

	/*
	 * Error handling middleware. Error responses should look different if they are
	 * in the API vs. in the front end so we want separate middleware for it.
	 */
	router.use((err, req, res, next) => {
		if (err) {
			res.status(err.status).json(err);
		} else {
			next();
		}
	});

	return router;
}

/**
 * Build the Express application with all middleware.
 *
 * @param {Boolean} development Development mode?
 * @return {Object} Express application
 */
function buildApp(development) {
	const app = express();

	const DIST_DIR = path.join(__dirname, '../dist');

	// Set the static files location, /dist/images will be /images for users
	app.use(express.static(DIST_DIR));

	if (development) {
		/*
		 * In development mode when the source code is changed webpack
		 * automatically rebuilds the bundle. In production the bundle is
		 * precompiled prior to running the application.
		 */
		const webpack = require('webpack');
		const webpackDevMiddleware = require('webpack-dev-middleware');
		const webpackHotMiddleware = require('webpack-hot-middleware');
		const webpackDevConfig = require('../webpack.config.dev');

		const compiler = webpack(webpackDevConfig);

		app.use(
			webpackDevMiddleware(compiler, {
				hot: true,
				publicPath: webpackDevConfig.output.publicPath,
				noInfo: true
			})
		);
		app.use(webpackHotMiddleware(compiler));
	}

	app.use(
		bodyParser.urlencoded({
			extended: true
		}),
		bodyParser.json()
	);

	// Set up our routers
	app.use('/api', buildApiRouter());
	app.use('/db', require('express-pouchdb')(PouchDB));

	// Thank the LORD this works correctly
	app.get('*', function (req, res) {
		res.sendFile(path.join(DIST_DIR, 'index.html'));
	});

	return app;
}

/**
 * Start the server. This creates the Express app object, and initializes
 * the mongoose database connection.
 *
 * @param {Boolean} testMode
 */
function startServer(testMode) {
	const developmentMode = isDevelopmentMode() && (!testMode);

	const options = {
		replicaSet: 'rs',
		useNewUrlParser: true,
	};
	if (process.env.DATABASEURL) {
		mongoose.connect(process.env.DATABASEURL, options);
	} else {
		mongoose.connect(getDatabaseURL(), options);
	}

	mongoose.Promise = global.Promise;

	const port = process.env.PORT || PP_PORT;
	const localhostArgs = ['127.0.0.1', 511];

	const serverStarted = (event) => {
		console.log('Server running on port ' + port);
	}

	const app = buildApp(developmentMode);

	if (!testMode) {
		if (process.env.LOCALHOST_ONLY) {
			app.listen(
				port,
				...localhostArgs,
				serverStarted
			);
		} else {
			app.listen(
				port,
				serverStarted
			);
		}
	}

	return app;
}

module.exports = {
	startServer
};
