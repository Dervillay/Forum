document.getElementById("refresh").addEventListener("click", async function(event) {

  let usersResponse = await fetch("http://127.0.0.1:8090/users");
  let usersBody = await usersResponse.text();

  let messagesResponse = await fetch("http://127.0.0.1:8090/messages");
  let messagesBody = await messagesResponse.text();


  document.getElementById("content").innerHTML = "<ul id=\"posts\">";

  let usersPost = JSON.parse(usersBody);
  let messagesPost = JSON.parse(messagesBody);

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
    `;
  };

  document.getElementById("content").innerHTML += "</ul>";

});

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

function openForm() {
  document.getElementById("form").style.display = "block";
  document.getElementById("makePost").style.display = "none";
}

function closeForm() {
  document.getElementById("form").style.display = "none";
  document.getElementById("makePost").style.display = "block";
}
