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

// List to track all signed up users
let users = [];

// List to track all messages posted to the forum
let messages = [];

// List to track currently signed in users
let signedIn = [];

// Variable for storing search queries
let query = '';


// Signs a user in
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
      if (users[i]["username"] == username) {
        var password = users[i]["password"];
        userExists = true;
      }
    }

    // If submitted username doesn't exist, sends a 404 error response
    if (!userExists) {
      return res.status(404).json({status: "unsuccessful", message: "No user with that username could be found."});
    }

    // Compares the inputted password and encrypted password asynchronously
    bcrypt.compare(req.body.signInPassword, password, (err, resp) => {
      if (resp) {
        // Creates unique user token using secret in config
        var token = jwt.sign({id: username}, config.secret , {
          expiresIn: 86400 // Expires in 24 hours
        });

        // Adds the current user to signedIn after checking they aren't already signed in from elsewhere
        if (!signedIn.includes(username)) {
          signedIn.push(username);
        } else {
          return res.status(409).json({status: "unsuccessful", message: "That user is already signed in from elsewhere."});
        }

        // Logs to server console that the user has logged in
        console.log('> User \'' + username + '\' logged in on ' + dateTime);

        // Sends successful response with sign in success message and token
        return res.status(200).json({status: "success", message: "Sign in successful.", token: token});
      } else {
        // Sends unsuccessful response with incorrect password message
        return res.status(403).json({status: "unsuccessful", message: "The password entered was incorrect, please try again."});
      }
    });
  // Catches errors and sends server error response
  } catch (error) {
    return res.status(500).json({status: "unsuccessful", message: "Sign in unsuccessful. Server encountered an error."});
  }
});


// Signs out user
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

    // Removes user from list of signed in users
    signedIn.splice(signedIn.indexOf(user), 1);

    // Logs to server that this user has logged out
    console.log('> User \'' + user + '\' logged out at ' + dateTime);

    // Sends success response
    return res.status(200).json({status: "successful", message: "Sign out successful."});
  }
  // Catches any errors and sends server error repsonse
  catch (error) {
    return res.status(500).json({status: "successful", message: "Sign out unsuccessful. The server encountered an error."});
  }
});


// Logs that a user has signed in via Google to the server console
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
    signedIn.push(user);

    // Logs to server that this user has logged in
    console.log('> User \'' + user + '\' logged in via Google on ' + dateTime);
    return res.status(200).json({status: "success", message: "Signed in successfully via Google.", token: token});
  }
  // Catches errors are sends server error response
  catch (error) {
    return res.status(500).json({status: "unsuccessful", message: "Sign in unsuccessful. The server encountered an error."});
  }
});


// Logs that a user has signed out via Google to the server console
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
    return res.status(200).json({status: "successful", message: "Signed out successfully."});
  }
  // Catches errors are sends server error response
  catch (error) {
    return res.status(500).json({status: "unsuccessful", message: "Sign out unsuccessful. The server encountered an error."});
  }
});


// Adds a message and its metadata to list messages
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
    let message =  '{ \"postedBy\":\"' + req.body.postUsername + '\",' +
                '\"content\":\"' + req.body.message + '\",' +
                '\"datePosted\":\"' + dateTime + '\"' +
                '}';

    // Turns message into JSON
    let messageJSON = JSON.parse(message);

    // Tries to get token from header and checks if one has been provided, sends response if not
    var token = req.headers['x-access-token'];
    if (!token) {
      return res.status(401).json({status: "unsuccessful", message: "No token provided."});
    }

    // Attempts to verify the token and outputs a response appropriately
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(500).json({status: "unsuccessful", message: "Failed to authenticate token."});
      }
      // If token verified successfully, pushes message to messages and sends response
      messages.push(messageJSON);
      return res.status(200).json({status: "successful", message: "Post submitted successfully."});
    });
  }
  // Catches errors and sends appropriate response code
  catch (error) {
    return res.status(500).json({status: "unsuccessful", message: "Message was not posted. Server encountered an error"});
  }
});


// Adds a user to users
app.post('/addUser', (req, res) => {
  try {
    // Gets username from HTML form
    let username = req.body.username;
    let email = req.body.email;

    // Checks if user already exists and if they do sends a 409 error response
    for (let i = 0; i < users.length; i++) {
      if (users[i]["username"] == username || users[i]["email"] == email) {
        return res.status(409).json({status: "unsuccessful", message:"An account with that username or email already exists."});
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
    let user =  '{ \"username\":\"' + username + '\",' +
                '\"email\":\"' + email + '\",' +
                '\"dateJoined\":\"' + d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + '\"' +
                '}';

    // Turns user into a JSON object
    let userJSON = JSON.parse(user);

    // Encrypts password asynchronously with 10 salt rounds and stores in userJSON
    bcrypt.hash(req.body.password, 10)
      .then((hash, err) => {
        userJSON["password"] = hash;

      // Creates unique user token using secret in config
      var token = jwt.sign({id: username}, config.secret , {
        expiresIn: 86400 // Expires in 24 hours
      });

      // Adds userJSON to users and their username to signedIn
      users.push(userJSON);
      signedIn.push(userJSON['username']);

      // Logs to server console that the user has created an account and logged in
      console.log('> New user \'' + userJSON['username'] + '\' logged in on ' + dateTime);
      return res.status(200).json({status: "success", message: "Account creation was successful.", token: token});
    })
    // Catches and handles errors during hashing, sending server error response
    .catch(err => {
      throw (new Error(err));
      return res.status(500).json({status: "unsuccessful", message: "The server encountered an error. Account creation unsuccessful."});
    });
  }
  // Catches and handles errors, sending server error response
  catch (error) {
    return res.status(500).json({status: "unsuccessful", message: "The server encountered an error. Account creation unsuccessful."});
  }
});


// Gets list of users
app.get('/users', (req, res) => {
  try {
    // Tries to get token from header and checks if one has been provided
    var token = req.headers['x-access-token'];
    if (!token) {
      return res.status(401).json({status: "unsuccessful", message: "No token provided."});
    }

    // Attempts to verify the token and outputs a response appropriately
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(500).json({status: "unsuccessful", message: "Failed to authenticate token."});
      } else {
        return res.status(200).json(users);
      }
    });
  }
  // Catches server errors and sends appropriate response
  catch (error) {
    return res.status(500).json({status: "unsuccessful", message: "Unable to get users. The server encountered an error."});
  }
});


// Gets list of messages
app.get('/messages', (req, res) => {
  try {
    // Returns JSON content of variable messages
    return res.status(200).json(messages);
  }
  // Catches server errors and sends appropriate response
  catch (error) {
    return res.status(500).json({status: "unsuccessful", message: "Unable to get messages. The server encountered an error."});
  }
});


// Gets list of currently signed in users
app.get('/signedIn', (req, res) => {
  try {
    // Tries to get token from header and checks if one has been provided
    var token = req.headers['x-access-token'];
    if (!token) {
      return res.status(401).json({status: "unsuccessful", message: "No token provided."});
    }

    // Attempts to verify the token and outputs a response appropriately
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(500).json({status: "unsuccessful", message: "Failed to authenticate token."});
      } else {
        return res.status(200).json(signedIn);
      }
    });
  }
  // Catches server errors and sends appropriate response
  catch (error) {
    return res.status(500).json({status: "unsuccessful", message: "Unable to get signed in users. The server encountered an error."});
  }
});


// Listens on port 8090
app.listen(8090, () => {
  console.log('> Listening on localhost:8090')
});
