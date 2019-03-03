const express = require('express');
const app = express();

users = [];
messages = [];

app.use(express.static('client'));
app.use(express.urlencoded());

app.post('/addUser', function(req, res) {
  users.push(req.body.username);
  console.log(users);
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

app.listen(8090);
