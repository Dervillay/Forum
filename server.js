// Initial setup
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./config');
const app = express();

// Adds all necessary packages
app.use(express.static('client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// List to track all signed up users
let users = [];

// List to track all messages posted to the forum
let messages = [];

// List to track currently signed in users
let signedIn = [];

// Defines search query as initially empty string
let query = '';

// Adds message and its metadata to list
app.post('/addMessage', function(req, res) {
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
    let message =  '{ \"postedBy\":\"' + req.body.postUsername + '\",' +
                '\"content\":\"' + req.body.message + '\",' +
                '\"datePosted\":\"' + dateTime + '\"' +
                '}';

    // Turns message into a JSON object and pushes it to messages
    let messageJSON = JSON.parse(message);
    messages.push(messageJSON);

    // Sends success response
    res.status(200).json({status: "success"});

  }
  // Catches errors and sends appropriate response code
  catch (error) {
    res.status(500).json({status: "unsuccessful"});
  }
});

// Adds user to users
app.post('/addUser', function(req, res) {
  try {
    // Creates new Date object to calculate date account was created
    let d = new Date();

    // Gets username from HTML form
    let username = req.body.username;
    let email = req.body.email;

    // Checks if user already exists
    for (let i = 0; i < users.length; i++) {
      if (users[i]["username"] == (username) || users[i]["email"].includes(email)) {
        res.status(409).json({status: "unsuccessful", message:"A user with that username or email already exists."});
      }
    }

    // Gets current date and time and stores it in dateTime
    let dateTime = new Date().toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Creates variable user to store info
    let user =  '{ \"username\":\"' + username + '\",' +
                '\"email\":\"' + email + '\",' +
                '\"dateJoined\":\"' + d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + '\"' +
                '}';

    // Turns user into a JSON object
    let userJSON = JSON.parse(user);

    // Encrypts password with 10 salt rounds and stores in userJSON
    bcrypt.hash(req.body.password, 10)
    .then(function(hash, err) {
      userJSON["password"] = hash;

      // Creates unique user token using secret
      var token = jwt.sign({id: username}, config.secret , {
        expiresIn: 86400 // Expires in 24 hours
      });

      // Adds userJSON to users and their username to signedIn
      users.push(userJSON);
      signedIn.push(userJSON['username']);

      // Logs to server console that the user has created an account and logged in
      console.log('> New user \'' + userJSON['username'] + '\' logged in on ' + dateTime);
      res.status(200).json({status: "success", token: token});
    })
    // Catches and handles errors
    .catch(err => {
      throw (new Error(err));
      res.status(500).json({status: "unsuccessful", message: "Account creation was unsuccessful, please try again."});
    });
  }
  // Catches errors and sends appropriate response code
  catch (error) {
      res.status(500).json({status: "unsuccessful", message: "Account creation was unsuccessful, please try again."});
    }
});

// Signs a user in
app.post('/signIn', function(req, res) {
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

    // Iterates through all users and gets the correct encrypted password
    for (let i = 0; i < users.length; i++) {
      if (users[i]["username"] == username) {
        var password = users[i]["password"];
      }
    }
    // Compares the inputted password and encrypted password
    bcrypt.compare(req.body.signInPassword, password, function(err, resp) {
      if (resp) {

        /* If they match, adds the current user to signedIn and alerts them of success
        and uses if statement to prevent multiple logins from confusing the server */
        if (!signedIn.includes(username)) {
          signedIn.push(username);
        }

        // Logs to server console that the user has logged in
        console.log('> User \'' + username + '\' logged in on ' + dateTime);

        // Sends successful response
        res.status(200).json({status: "success"});
      } else {
        // Sends unsuccessful response with forbidden error code since password was incorrect
        res.status(403).json({status: "unsuccessful"});
      }
    });
  }
  // Catches errors and sends appropriate response code
  catch (error) {
    res.status(500).json({status: "unsuccessful"});
  }
});

app.post('/sendQuery', function(req, res) {
  try {
    query = req.body.query;
    res.status(200).json({status: "success"});
  }
  // Catches errors and sends appropriate response code
  catch (error) {
    res.status(500).json({status: "unsuccessful"})
  }
});

app.get('/googleSignIn/:user', function(req, res) {
  // Gets current date and time and stores it in dateTime
  let dateTime = new Date().toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'

  });

  // Takes user from parameter passed to method and pushes it to signedIn
  let user = req.params.user;
  signedIn.push(user);

  // Logs to server that this user has logged in
  console.log('> User \'' + user + '\' logged in via Google on ' + dateTime);
  res.status(200).json(signedIn);
});

app.get('/googleSignOut/:user', function(req, res) {
  // Gets current date and time and stores it in dateTime
  let dateTime = new Date().toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Takes user from parameter passed to method
  let user = req.params.user;

  // Removes user from signedIn
  signedIn.splice(signedIn.indexOf(user), 1);

  // Logs to server that this user has logged out
  console.log('> User \'' + user + '\' logged out via Google on ' + dateTime);
  res.status(200).json(signedIn);
});

// Gets list of users
app.get('/users', function(req, res) {

  // Tries to get token from header and checks if one has been provided
  var token = req.headers['x-access-token'];
  if (!token) {
    return res.status(401).json({status: "unsuccessful", message: "No token provided."});
  }

  // Attempts to verify the token and outputs a response appropriately
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) {
      return res.status(500).json({status: "unsuccessful", message: "Failed to authenticate token."});
    }
    res.status(200).json(users);
  });
});

// Gets list of messages
app.get('/messages', function(req, res) {
  res.status(200).json(messages);
});

// Gets list of currently signed in users
app.get('/signedIn', function(req, res) {
  res.status(200).json(signedIn);
});

// Signs out user
app.get('/signOut/:user', function(req, res) {
  // Gets current date and time and stores it in dateTime
  let dateTime = new Date().toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Takes user from parameter passed to method
  let user = req.params.user;

  // Removes user from list of signed in users
  signedIn.splice(signedIn.indexOf(user), 1);

  // Logs to server that this user has logged out
  console.log('> User \'' + user + '\' logged out at ' + dateTime);

  // Sends success response
  res.status(200).json(signedIn);
});

// Gets current value of query
app.get('/query', function(req, res) {
  res.status(200).json({result: query.toLowerCase()});
});

// Listens on port 8090
app.listen(8090, () => {
  console.log('> Listening on localhost:8090')
});
