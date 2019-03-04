// Refresh and update page when refresh button clicked
document.getElementById("refresh").addEventListener("click", async function(event) {

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

});

// Searches page for posts with content matching query string
function searchPage() {

  // Declares all relevant variables
  var input, filter, ul, li, a, i, txtValue;

  // Gets search query
  input = document.getElementById("query");

  // Makes search function case insensitive
  filter = input.value.toUpperCase();

  ul = document.getElementById("posts");
  li = ul.getElementsByTagName('li');

  // Loop through all list items, and hide those that don't match the query
  for (i = 0; i < li.length; i++) {

    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;

    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }

  }
}

// Opens pop-up form
function openForm() {
  document.getElementById("form").style.display = "block";
  document.getElementById("makePost").style.display = "none";
}

// Closes pop-up form
function closeForm() {
  document.getElementById("form").style.display = "none";
  document.getElementById("makePost").style.display = "block";
}
