// Initial setup
const bcrypt = require('bcryptjs');
const express = require('express');
const bodyParser = require('body-parser');
const alert = require('alert-node');
const app = express();

// Adds all necessary packages
app.use(express.static('client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
  users.push(req.body.username);
  messages.push(req.body.message);
});

// Adds user to users
app.post('/addUser', function(req, res) {
  // Creates new Date object to calculate date account was created
  let d = new Date();

  username = req.body.username;

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
    // Adds userJSON to users
    users.push(userJSON);
  })
  // Catches and handles errors
  .catch(err => {
    throw (new Error(err))
  });
});

// Signs a user in
app.post('/signIn', function(req, res) {
  // Iterates through all users and gets the correct encrypted password
  for (let i = 0; i < users.length; i++) {
    if (users[i]["username"] == req.body.signInUsername) {
      password = users[i]["password"];
    }
  }
  // Compares the inputted password and encrypted password
  bcrypt.compare(req.body.signInPassword, password, function(err, res) {
    if (res) {
      // If they match, adds the current user to signedIn and alerts them of success
      signedIn.push(req.body.signInUsername);

      // Gets current date and time and stores it in dateTime
      let dateTime = new Date().toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Logs to server console that the user has logged in
      console.log('> User \'' + req.body.signInUsername + '\' logged in at ' + dateTime);
      alert('You have signed in successfully. Please press close to continue to the site');

    // If not, asks them to try again
    } else {
      alert('Password was incorrect, please try again');
    }
    // needs error handling or alert if unsuccessful
  });
});

app.post('/query', function(req, res) {
  query = req.body.query;
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

// Gets current value of query
app.get('/query', function(req, res) {
  res.send(query.toLowerCase());
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
  console.log('Listening on localhost:8090')
});
