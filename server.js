// Initial setup
const bcrypt = require('bcryptjs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded());

// Defines intially empty lists: users and messages
let users = [];
let messages = [];

// Defines search query as initially empty string
let query = "";

// Adds user and message to respective lists
app.post('/addPost', function(req, res) {
  users.push(req.body.username);
  messages.push(req.body.message);
});

// Adds user to users
app.post('/addUser', function(req, res) {
  // Creates new Date object to calculate date account was created
  let d = new Date();

  // Creates variable user to store info
  let user = '{ \"username\":\"' + req.body.username + '\",' +
              '\"email\":\"' + req.body.email + '\",' +
              '\"dateJoined\":\"' + d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + '\"' +
              '}';

  // Turns user into a JSON object
  let userJSON = JSON.parse(user);

  // Generates salt with 10 rounds
  bcrypt.genSalt(10)

  // Stores salt in user object
  .then(salt => {
    userJSON["salt"] = salt;

    return bcrypt.hash(req.body.password, salt);
  })
  // Stores hashed password in user object
  .then(hash => {
    userJSON["password"] = hash;

    // Adds userJSON to users
    users.push(userJSON);
  })
  // Catches and handles errors
  .catch(err => {
    throw (new Error(err))
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
app.listen(8090);
