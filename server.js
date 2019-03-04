// Initial setup
const express = require('express');
const app = express();

app.use(express.static('client'));
app.use(express.urlencoded());

// Defines intially empty lists: users and messages
let users = [];
let messages = [];

// Adds user and message to respective lists
app.post('/add', function(req, res) {
  users.push(req.body.username);
  messages.push(req.body.message);
  console.log(users, messages);
});

// Gets list of users
app.get('/users', function(req, res) {
  res.send(users);
})

// Gets list of messages
app.get('/messages', function(req, res) {
  res.send(messages);
})

// Listens on port 8090
app.listen(8090);
