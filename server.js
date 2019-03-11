// Initial setup
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
  var d = new Date();
  var user = '{ \"username\":\"' + req.body.username + '\",' +
              '\"email\":\"' + req.body.email + '\",' +
              '\"password\":\"' + req.body.password + '\",' +
              '\"dateJoined\":\"' + d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear() + '\"' +
              '}';

  users.push(JSON.parse(user));
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
