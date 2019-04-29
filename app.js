// Initial setup
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./config');
const app = express();

app.use(express.static('client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/** Array to track all signed up users
 * @name users*/
let users = [{ username: 'SampleUser',	email: 'sample@user.com', dateJoined: '01/01/2019', password:'$2a$10$.UL67koNiMxcpBp.fTC6J.KZy78V4ipd7uCdTa26uZ9jCLxU3MFbi' },
	{ username: 'SampleUser2',	email: 'sample@user.com', dateJoined: '01/01/2019', password:'$2a$10$.UL67koNiMxcpBp.fTC6J.KZy78V4ipd7uCdTa26uZ9jCLxU3MFbi' },
	{ username: 'SampleUser3',	email: 'sample@user.com', dateJoined: '01/01/2019', password:'$2a$10$.UL67koNiMxcpBp.fTC6J.KZy78V4ipd7uCdTa26uZ9jCLxU3MFbi' }];
// Passwords are encrypted form of 'password123'
// Contains sample users for jest testing

/** Array to track all messages posted to the forum
 * @name messages */
let messages = [{postedBy: 'SampleUser', content: 'Welcome to Forum! This is a sample message.', datePosted: '01/01/2019'}];
// Contains sample message for jest testing

/** Array to track currently signed in users
 * @name signedIn*/
let signedIn = ['SampleUser'];


/** Attempts to sign a user in, checks if an account with the
 * name in the request body exists and checks if their encrypted
 * password matches that saved in users. On Successful sign in, a
 * token is generated and sent in the response.
 * @name POST /signIn
 * @path {POST} /signIn
 * @body {String} signInUsername The user signing in's username
 * @body {String} signInPassword The user signing in's password
 * @code {200} if sign in is successful
 * @code {404} if no user matching signInUsername can be found
 * @code {409} if the user attempting to log in is already logged in elsewhere
 * @code {403} if password is incorrect
 * @code {500} if server encounters an error
 * @response {JSON} status Whether request was successful or unsuccessful
 * @response {JSON} message Details the result of the request
 * @response {JSON} token (on success) A JavaScript Web Token that expires in 24 hours */
app.post('/signIn', (req, res) => {
	try {
		// Gets current date and time and stores it in dateTime
		let dateTime = new Date().toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

		// Stores username of user trying to sign in
		let username = req.body.signInUsername;

		// Variable to determine whether user already exists
		let userExists = false;

		// Iterates through all users and gets the correct encrypted password
		for (let i = 0; i < users.length; i++) {
			if (users[i]['username'] == username) {
				var password = users[i]['password'];
				userExists = true;
			}
		}

		// If submitted username doesn't exist, sends a 404 error response
		if (!userExists) {
			return res.status(404).json({status: 'unsuccessful', message: 'No user with that username could be found.'});
		}

		// Compares the inputted password and encrypted password asynchronously
		bcrypt.compare(req.body.signInPassword, password, (err, resp) => {
			if (resp) {
				// Creates unique user token using secret in config
				var token = jwt.sign({id: username}, config.secret, {
					expiresIn: 86400 // Expires in 24 hours
				});

				// Adds the current user to signedIn after checking they aren't already signed in from elsewhere
				if (!signedIn.includes(username)) {
					signedIn.push(username);
				} else {
					return res.status(409).json({status: 'unsuccessful', message: 'That user is already signed in from elsewhere.'});
				}

				// Logs to server console that the user has logged in
				console.log('> User \'' + username + '\' logged in on ' + dateTime);

				// Sends successful response with sign in success message and token
				return res.status(200).json({status: 'success', message: 'Sign in successful.', token: token});
			} else {
				// Sends unsuccessful response with incorrect password message
				return res.status(403).json({status: 'unsuccessful', message: 'The password entered was incorrect, please try again.'});
			}
		});
		// Catches errors and sends server error response
	} catch (error) {
		return res.status(500).json({status: 'unsuccessful', message: 'Sign in unsuccessful. Server encountered an error.'});
	}
});


/** Attempts to sign user out by removing the user from signedIn.
 * @name POST /signOut
 * @path {POST} /signOut
 * @code {200} if sign out is successful
 * @code {401} if no token is provided
 * @code {400} if token cannot be authenticated
 * @code {500} if server encounters an error
 * @auth This route requires JavaScript Web Token authentication.
 * @header {String} x-access-token The JavaScript Web Token sent on a successful sign in/up
 * @body {String} user The user signing out's user name.
 * @response {JSON} status Whether request was successful or unsuccessful
 * @response {JSON} message Details the result of the request */
app.post('/signOut', (req, res) => {
	try {
		// Gets current date and time and stores it in dateTime
		let dateTime = new Date().toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

		// Takes user from parameter passed to method
		let user = req.body.user;

		// Tries to get token from header and checks if one has been provided, sends response if not
		var token = req.headers['x-access-token'];
		if (!token) {
			// Returned if no token provided or a sign out is attempted without being logged in
			return res.status(401).json({status: 'unsuccessful', message: 'No token provided.'});
		}

		// Attempts to verify the token and outputs a response appropriately
		jwt.verify(token, config.secret, (err) => {
			if (err) {
				return res.status(400).json({status: 'unsuccessful', message: 'Failed to authenticate token.'});
			}
			// If token verified successfully, removes user from array of signed in users
			signedIn.splice(signedIn.indexOf(user), 1);

			// Logs to server that this user has logged out
			console.log('> User \'' + user + '\' logged out at ' + dateTime);

			// Sends success response
			return res.status(200).json({status: 'successful', message: 'Sign out successful.'});
		});
	}
	// Catches any errors and sends server error repsonse
	catch (error) {
		return res.status(500).json({status: 'successful', message: 'Sign out unsuccessful. The server encountered an error.'});
	}
});


/** Logs that a user has signed in via Google to the server console and
 * sends a token for authorising the user's subsequent actions.
 * @name POST /googleSignIn
 * @path {POST} /googleSignIn
 * @code {200} if Google sign in is successful
 * @code {500} if server encounters an error
 * @body {String} user The user signing in's username.
 * @response {JSON} status Whether request was successful or unsuccessful
 * @response {JSON} message Details the result of the request
 * @response {JSON} token (on success) A JavaScript Web Token that expires in 24 hours */
app.post('/googleSignIn', (req, res) => {
	try {
		// Gets current date and time and stores it in dateTime
		let dateTime = new Date().toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

		// Takes user from parameter passed to method and pushes it to signedIn
		let user = req.body.user;

		// Creates unique user token using secret in config
		var token = jwt.sign({id: user}, config.secret, {
			expiresIn: 86400 // Expires in 24 hours
		});

		// Pushes user to signedIn
		signedIn.push(user);

		// Logs to server that this user has logged in
		console.log('> User \'' + user + '\' logged in via Google on ' + dateTime);
		return res.status(200).json({status: 'success', message: 'Signed in successfully via Google.', token: token});
	}
	// Catches errors are sends server error response
	catch (error) {
		return res.status(500).json({status: 'unsuccessful', message: 'Sign in unsuccessful. The server encountered an error.'});
	}
});


/** Logs that a user has signed out via Google to the server console.
 * Does not require a token since Google handles its own authentication through OAuth2.
 * @name POST /googleSignOut
 * @path {POST} /googleSignOut
 * @code {200} if Google sign out is successful
 * @code {500} if server encounters an error
 * @body {String} user The user signing out's username.
 * @response {JSON} status Whether request was successful or unsuccessful
 * @response {JSON} message Details the result of the request */
app.post('/googleSignOut', (req, res) => {
	try {
		// Gets current date and time and stores it in dateTime
		let dateTime = new Date().toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

		// Takes user from parameter passed to method
		let user = req.body.user;

		// Removes user from signedIn
		signedIn.splice(signedIn.indexOf(user), 1);

		// Logs to server that this user has logged out
		console.log('> User \'' + user + '\' logged out via Google on ' + dateTime);
		return res.status(200).json({status: 'successful', message: 'Signed out successfully.'});
	}
	// Catches errors are sends server error response
	catch (error) {
		return res.status(500).json({status: 'unsuccessful', message: 'Sign out unsuccessful. The server encountered an error.'});
	}
});


/** Adds the message in the request body and its metadata to the array 'messages'.
 * @name POST /addMessage
 * @path {POST} /addMessage
 * @code {200} if message is added successfully
 * @code {401} if no token is provided
 * @code {400} if token cannot be authenticated
 * @code {500} if server encounters an error
 * @auth This route requires JavaScript Web Token authentication.
 * @header {String} x-access-token The JavaScript Web Token sent on a successful sign in/up
 * @body {String} postUsername Username of the user submitting the message.
 * @body {String} message Content of the message
 * @response {JSON} status Whether request was successful or unsuccessful
 * @response {JSON} message Details the result of the request */
app.post('/addMessage', (req, res) => {
	try {
		// Gets current date and time and stores it in dateTime
		let dateTime = new Date().toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

		// Creates variable message to store metadata of the message
		let message =  '{ "postedBy":"' + req.body.postUsername + '",' +
                '"content":"' + req.body.message + '",' +
                '"datePosted":"' + dateTime + '"' +
                '}';

		// Turns message into JSON
		let messageJSON = JSON.parse(message);

		// Tries to get token from header and checks if one has been provided, sends response if not
		var token = req.headers['x-access-token'];
		if (!token) {
			return res.status(401).json({status: 'unsuccessful', message: 'No token provided.'});
		}

		// Attempts to verify the token and outputs a response appropriately
		jwt.verify(token, config.secret, (err) => {
			if (err) {
				return res.status(400).json({status: 'unsuccessful', message: 'Failed to authenticate token.'});
			}
			// If token verified successfully, pushes message to messages and sends response
			messages.push(messageJSON);
			return res.status(200).json({status: 'successful', message: 'Post submitted successfully.'});
		});
	}
	// Catches errors and sends appropriate response code
	catch (error) {
		return res.status(500).json({status: 'unsuccessful', message: 'Message was not posted. Server encountered an error'});
	}
});


/** Attempts to add a new user to users with the details submitted in the request body,
 * checking if the submitted email or username already exist in users. If successful,
 * the submitted password is encrypted with 10 salt rounds, the user is added to users
 * and a token is sent in the response to validate methods whilst the user is logged in.
 * @name POST /signUp
 * @path {POST} /signUp
 * @code {200} if sign up is successful
 * @code {409} if an account with username or email matching those submitted already exists
 * @code {500} if server encounters an error
 * @body {String} username The user's username.
 * @body {String} email The user's email
 * @body {String} password The user's password
 * @response {JSON} status Whether request was successful or unsuccessful
 * @response {JSON} message Details the result of the request
 * @response {JSON} token (on success) A JavaScript Web Token that expires in 24 hours */
app.post('/signUp', (req, res) => {
	try {
		// Gets username from HTML form
		let username = req.body.username;
		let email = req.body.email;

		// Checks if user already exists and if they do sends a 409 error response
		for (let i = 0; i < users.length; i++) {
			if (users[i]['username'] == username || users[i]['email'] == email) {
				return res.status(409).json({status: 'unsuccessful', message:'An account with that username or email already exists.'});
			}
		}

		// Creates new Date object to calculate date account was created
		let d = new Date();

		// Gets current date and time and stores it in dateTime
		let dateTime = new Date().toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

		// Creates variable user to store info
		let user =  '{ "username":"' + username + '",' +
                '"email":"' + email + '",' +
                '"dateJoined":"' + d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + '"' +
                '}';

		// Turns user into a JSON object
		let userJSON = JSON.parse(user);

		// Encrypts password asynchronously with 10 salt rounds and stores in userJSON
		bcrypt.hash(req.body.password, 10)
			.then(hash => {
				userJSON['password'] = hash;

				// Creates unique user token using secret in config
				var token = jwt.sign({id: username}, config.secret, {
					expiresIn: 86400 // Expires in 24 hours
				});

				// Adds userJSON to users and their username to signedIn
				users.push(userJSON);
				signedIn.push(userJSON['username']);

				// Logs to server console that the user has created an account and logged in
				console.log('> New user \'' + userJSON['username'] + '\' logged in on ' + dateTime);
				return res.status(200).json({status: 'success', message: 'Account creation was successful.', token: token});
			})
			// Catches and handles errors during hashing, sending server error response
			.catch(err => {
				return res.status(500).json({status: 'unsuccessful', message: 'Account creation unsuccessful.' + err});
			});
	}
	// Catches and handles errors, sending server error response
	catch (error) {
		return res.status(500).json({status: 'unsuccessful', message: 'The server encountered an error. Account creation unsuccessful.'});
	}
});


/** Takes an optional parameter username, returning the information of the specified user,
 * or if unspecified, the information of all users.
 * @name GET /users
 * @path {GET} /users/:username?
 * @code {200} if users are sent successfully
 * @code {401} if no token is provided
 * @code {400} if token cannot be authenticated
 * @code {404} if a specified user cannot be found
 * @code {500} if server encounters an error
 * @param {String} username (optional) Gets all information about a user except their password
 * @auth This route requires JavaScript Web Token authentication
 * @header {String} x-access-token The JavaScript Web Token sent on a successful sign in/up
 * @response {JSON} users (on success) All users registered with the forum
 * @response {JSON} user (on success if parameter specified) Information of specified user
 * @response {JSON} status (on failure) Whether request was successful or unsuccessful
 * @response {JSON} message (on failure) Details the result of the request */
app.get('/users/:username?', (req, res) => {
	try {
		// Tries to get token from header and checks if one has been provided
		var token = req.headers['x-access-token'];
		if (!token) {
			return res.status(401).json({status: 'unsuccessful', message: 'No token provided.'});
		}

		// Attempts to verify the token and outputs a response appropriately
		jwt.verify(token, config.secret, (err) => {
			if (err) {
				return res.status(400).json({status: 'unsuccessful', message: 'Failed to authenticate token.'});
			} else {
				if (req.params.username) {
					for (let i = 0; i < users.length; i++) {
						if (users[i]['username'] == req.params.username) {
							// Returns user information without their password
							let user = users[i];
							delete user['password'];
							return res.status(200).json(user);
						}
					}
					// Returns that user does not exist if they cannot be found
					return res.status(404).json({status: 'unsuccessful', message: 'Specified user does not exist.'});
				} else {
					// If no parameter specified, returns full list of users
					return res.status(200).json(users);
				}
			}
		});
	}
	// Catches server errors and sends appropriate response
	catch (error) {
		return res.status(500).json({status: 'unsuccessful', message: 'Unable to get users. The server encountered an error.'});
	}
});

/** Gets all messages submitted by a user if a username is specified, otherwise
 * resturns a lits of all submitted messages. Does not expect a token since
 * messages can be viewed by all users regardless of whether they have an account.
 * @name GET /messages
 * @code {200} if messages are sent successfully
 * @code {404} if no user matching username can be found
 * @code {500} if server encounters an error
 * @path {GET} /messages/:username?
 * @param {String} username Username of user
 * @response {JSON} messages (on success) All messages stored on the forum
 * @response {JSON} matchingMessages (on success if username specified) All of specified user's messages
 * @response {JSON} status (on failure) Whether request was successful or unsuccessful
 * @response {JSON} message (on failure) Details the result of the request */
app.get('/messages/:username?', (req, res) => {
	try {
		let username = req.params.username;
		let userExists = false;

		// If username provided, finds matching messages
		if (username) {
			let matchingMessages = [];

			for (let i = 0; i < users.length; i++) {
				if (users[i]['username'] == username) {
					userExists = true;
				}
			}

			if (userExists == true) {

				for (let i = 0; i < messages.length; i++) {
					if (messages[i]['postedBy'] == username) {
						// Returns user information without their password
						matchingMessages.push(messages[i]);
					}
				}
				// Retuns all messages posted by specified user
				return res.status(200).json(matchingMessages);
			} else {
				// Returns error if specified user does not exist
				return res.status(404).json({status: 'unsuccessful', message: 'No user with that username could be found.'});
			}

			// If username not specified, returns all messages
		} else {
			return res.status(200).json(messages);
		}
	}
	// Catches server errors and sends appropriate response
	catch (error) {
		return res.status(500).json({status: 'unsuccessful', message: 'Unable to get messages. The server encountered an error.'});
	}
});


/**
 * Gets array of all currently signed in users. Expects token in header.
 *
 * @name GET /signedIn
 * @path {GET} /signedIn
 * @code {200} if signedIn is sent successfully
 * @code {401} if no token is provided
 * @code {400} if token cannot be authenticated
 * @code {500} if server encounters an error
 * @auth This route requires JavaScript Web Token authentication.
 * @header {String} x-access-token The JavaScript Web Token sent on a successful sign in/up
 * @response {JSON} users (on success) All currently signed in users
 * @response {JSON} status (on failure) Whether request was successful or unsuccessful
 * @response {JSON} message (on failure) Details the result of the request */
app.get('/signedIn', (req, res) => {
	try {
		// Tries to get token from header and checks if one has been provided
		var token = req.headers['x-access-token'];
		if (!token) {
			return res.status(401).json({status: 'unsuccessful', message: 'No token provided.'});
		}

		// Attempts to verify the token and outputs a response appropriately
		jwt.verify(token, config.secret, (err) => {
			if (err) {
				return res.status(400).json({status: 'unsuccessful', message: 'Failed to authenticate token.'});
			} else {
				return res.status(200).json(signedIn);
			}
		});
	}
	// Catches server errors and sends appropriate response
	catch (error) {
		return res.status(500).json({status: 'unsuccessful', message: 'Unable to get signed in users. The server encountered an error.'});
	}
});

// Exports app
module.exports = app;
