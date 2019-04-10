// Initial setup
const bcrypt = require('bcryptjs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Adds all necessary packages
app.use(express.static('client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded());

// Defines intially empty lists: users and messages
let users = [];
let messages = [];

// List to track currently signed in users
let signedIn = [];

// Defines search query as initially empty string
let query = '';

// Adds user and message to respective lists
app.post('/addPost', function(req, res) {
  // Gets current date and time and stores it in dateTime
  let dateTime = new Date().toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Creates variable message to store the info of the message
  let message =  '{ \"postedBy\":\"' + req.body.postUsername + '\",' +
              '\"content\":\"' + req.body.message + '\",' +
              '\"datePosted\":\"' + dateTime + '\"' +
              '}';

  // Turns user into a JSON object and pushes it to messages
  let messageJSON = JSON.parse(message);
  messages.push(messageJSON);

  // Sends success response
  res.json({status: "success", code: "200"});
});

// Adds user to users
app.post('/addUser', function(req, res) {
  // Creates new Date object to calculate date account was created
  let d = new Date();

  // Gets username from HTML form
  let username = req.body.username;

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
              '\"email\":\"' + req.body.email + '\",' +
              '\"dateJoined\":\"' + d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + '\"' +
              '}';

  // Turns user into a JSON object
  let userJSON = JSON.parse(user);

  // Encrypts password with 10 salt rounds and stores in userJSON
  bcrypt.hash(req.body.password, 10)
  .then(function(hash, err) {
    userJSON["password"] = hash;
    // Adds userJSON to users and their username to signedIn
    users.push(userJSON);
    signedIn.push(userJSON['username']);

    // Logs to server console that the user has created an account and logged in
    console.log('> New account \'' + userJSON['username'] + '\' logged in on ' + dateTime);
    res.json({status: "success", code: "200"});
  })
  // Catches and handles errors
  .catch(err => {
    throw (new Error(err))
    res.json({status: "unsuccessful", code: "500"})
  });
});

// Signs a user in
app.post('/signIn', function(req, res) {
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
      res.json({status: "success", code: "200"});
    } else {
      // Sends unsuccessful response with forbidden error code since password was incorrect
      res.json({status: "unsuccessful", code: "403"});
    }
  });
});

app.post('/sendQuery', function(req, res) {
  query = req.body.query;
  res.json({status: "success", code: "200"});
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
  res.send(signedIn);
});

// Gets list of users
app.get('/users', function(req, res) {
  res.send(users);
});

// Gets list of messages
app.get('/messages', function(req, res) {
  res.send(messages);
});

// Gets list of currently signed in users
app.get('/signedIn', function(req, res) {
  res.send(signedIn);
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
  res.send(signedIn);
});

// Gets current value of query
app.get('/query', function(req, res) {
  res.json({result:query.toLowerCase()});
});

app.get("/",function(req,res){
	res.sendFile("client/index.html", {root: __dirname });
});

app.get("/style.css", function(req, res) {
	res.sendFile(__dirname + "/client/" + "style.css");
});

app.get("/index.js", function(req, res) {
	res.sendFile(__dirname + "/client/" + "index.js");
});

app.get("/default_user.jpeg", function(req, res) {
	res.sendFile(__dirname + "/client/images/" + "default_user.jpeg");
});

// Listens on port 8090
app.listen(8090, () => {
  console.log('> Listening on localhost:8090')
});
