// Asynchronous function to update page with all users and messages
async function refreshPage(event) {

  // Uses GET method 'users' to receive list of users
  let usersResponse = await fetch("http://127.0.0.1:8090/users");
  let usersBody = await usersResponse.text();

  // Uses GET method 'messages' to receive list of messages
  let messagesResponse = await fetch("http://127.0.0.1:8090/messages");
  let messagesBody = await messagesResponse.text();

  // Creates <ul> tag with id 'posts' in main body of HTML
  document.getElementById("content").innerHTML = "<ul id=\"posts\">";

  // Parses data received by GET methods into JS objects
  let usersPost = JSON.parse(usersBody);
  let messagesPost = JSON.parse(messagesBody);

  // Iterates through users and messages and prduces forum posts using their information
  for (let i = 0; i < usersPost.length; i++) {
    document.getElementById("content").innerHTML +=
    `
    <li>
    <a>
    <div class=\"container-fluid container-user\">
      <div class=\"jumbotron post p-3\">
        <img src=\"images/default_user.jpeg\" alt=\"user_icon\" class=\"user\"> <p>` + usersPost[i] + `</p>
        <div class=\"jumbotron comment p-3\">
          `
          + messagesPost[i] +
          `
        </div>
      </div>
    </div>
    </a>
    </li>
    `
  };

  document.getElementById("content").innerHTML += "</ul>";

};

// Searches page for posts with content matching query string
async function searchPage() {

  // Uses GET method 'users' to receive list of users
  let usersResponse = await fetch("http://127.0.0.1:8090/users");
  let usersBody = await usersResponse.text();

  // Uses GET method 'messages' to receive list of messages
  let messagesResponse = await fetch("http://127.0.0.1:8090/messages");
  let messagesBody = await messagesResponse.text();

  // Uses GET method 'query' to receive search query
  let queryResponse = await fetch("http://127.0.0.1:8090/query");
  let queryBody = await queryResponse.text();

  // Parses data received by GET methods into JS objects
  let usersPost = JSON.parse(usersBody);
  let messagesPost = JSON.parse(messagesBody);

  // New list to store users and messages matching the query
  matchingUsers = []
  matchingMessages = []

  for (let i = 0; i < usersPost.length; i++) {
      if (usersPost[i].includes(queryBody) || messagesPost[i].includes(queryBody)) {
        matchingUsers.push(usersPost[i]);
        matchingMessages.push(messagesPost[i]);
      }
  }


  document.getElementById("content").innerHTML = "";

  // Iterates and updates all posts in matching lists
  for (let i = 0; i < matchingUsers.length; i++) {
    document.getElementById("content").innerHTML +=
    `
    <li>
    <a>
    <div class=\"container-fluid container-user\">
      <div class=\"jumbotron post p-3\">
        <img src=\"images/default_user.jpeg\" alt=\"user_icon\" class=\"user\"> <p>` + matchingUsers[i] + `</p>
        <div class=\"jumbotron comment p-3\">
          `
          + matchingMessages[i] +
          `
        </div>
      </div>
    </div>
    </a>
    </li>
    `
  };

  document.getElementById("content").innerHTML += "</ul>";


}

document.getElementById('search').addEventListener('click', searchPage);

// Opens pop-up form
function openForm() {
  document.getElementById("form").style.display = "block";
  document.getElementById("makePost").style.display = "none";
}

// Closes pop-up form, updates page and restores form
function closeForm() {
  document.getElementById("form").style.display = "none";
  document.getElementById("makePost").style.display = "block";
  refreshPage();
}
