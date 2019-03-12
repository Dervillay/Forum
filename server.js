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

  // Creates unique 10 round salt
  let salt = bcrypt.genSaltSync(10);

  // Sets userJSON's property password to hashed password
  userJSON["password"] = bcrypt.hashSync(req.body.password, salt);

  // Sets userJSON's property salt to salt
  userJSON["salt"] = salt;

  // Pushes user as JSON object to users
  users.push(userJSON);
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
