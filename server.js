const express = require('express');
const app = express();

app.use(express.static('client'));
app.use(express.urlencoded());

let users = [];
let messages = [];

app.post('/add', function(req, res) {
  users.push(req.body.username);
  messages.push(req.body.message);
  console.log(users, messages);
});

app.get('/users', function(req, res) {
  res.send(users);
})

app.get('/messages', function(req, res) {
  res.send(messages);
})

app.listen(8090);
