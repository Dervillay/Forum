/* Asynchronous function to update page with all users and messages.
 * Uses GET methods of server to recieve current list of users and
 * messages. It then iterates through them and inserts the final posts
 * in index.html
 */
async function refreshPage() {

  // Uses GET method 'users' to receive list of users
  let usersResponse = await fetch("http://127.0.0.1:8090/users");
  let usersBody = await usersResponse.text();

  // Uses GET method 'messages' to receive list of messages
  let messagesResponse = await fetch("http://127.0.0.1:8090/messages");
  let messagesBody = await messagesResponse.text();

  // Parses data received by GET methods into JS objects
  let usersPost = JSON.parse(usersBody);
  let messagesPost = JSON.parse(messagesBody);

  // Only updates page with posts if they exist
  if (usersPost.length > 0) {

    // Creates <ul> tag with id 'posts' in main body of HTML
    document.getElementById("content").innerHTML = "<ul id=\"posts\">";

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
  }
}

/*
async function successfulSubmit() {
  // Clears out message board area
  document.getElementById("inner-form").innerHTML =
  `
  <h6>Post submitted successfully!</h6>
  <button type="button" class="btn btn-secondary cancel" onclick="closeForm()">Close</button>
  `;
}
*/

/*
async function restoreForm() {
  document.getElementById("inner-form").innerHTML =
  `
  <h3>Make a Post</h3>

  <input type="text" placeholder="Enter Username" name="username" class="m-1" required><br>
  <textarea rows="4" cols="85" placeholder="Enter Message" name="message" class="m-1" required></textarea>

  <div>
    <button type="submit" class="btn btn-primary" onclick="successfulSubmit()">Post</button>
    <button type="button" class="btn btn-secondary cancel" onclick="closeForm()">Close</button>
  </div>
  `;
}
*/


/* Searches page for posts with content matching query string.
 * Takes current query value and compares it to currnently held
 * values for users and messages, rendering posts that match.
 */
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
  var matchingUsers = []
  var matchingMessages = []

  // Iterates through (lower case versions of) all users and messages and finds matches
  for (let i = 0; i < usersPost.length; i++) {
      if (usersPost[i].toLowerCase().includes(queryBody) || messagesPost[i].toLowerCase().includes(queryBody)) {
        matchingUsers.push(usersPost[i]);
        matchingMessages.push(messagesPost[i]);
      }
  }

  // Clears out message board area
  document.getElementById("content").innerHTML = "<ul id=\"posts\">";

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

/* Checks if email inputs are matching */
function checkEmail() {
  // Gets email inputs and stores them in variables
  var email = document.getElementById("email").value;
  var confirmEmail = document.getElementById("confirmemail").value;

  // Checks if both input fields are equal and that email is valid
  if (email != confirmEmail) {
    alert("Inputted emails are invalid or do not match");
    return false;
  } else {
    return true;
  }
}

/* Checks if password inputs are matching */
function checkPassword() {
  // Gets email inputs and stores them in variables
  var password = document.getElementById("password").value;
  var confirmPassword = document.getElementById("confirmpassword").value;

  // Checks if both input fields are equal
  if (password != confirmPassword) {
    alert('Inputted passwords do not match');
    return false;
  } else {
    return true;
  }
}

/* Opens pop-up form by setting sign up form's display
 * to 'block' defaultText's display to 'none' */
function openSignUp() {
  document.getElementById("signup").setAttribute('style', 'display:block !important');
  document.getElementById("defaultText").style.display = "none";
}

/* Closes pop-up form by setting sign up form's display
 * value to 'none' */
function closeSignUp() {
  document.getElementById("signup").setAttribute('style', 'display: none !important');
}

/* Submits sign up form and creates alert informing user
 * that submission was successful and closes the form */
function submitSignUp() {
  if (checkEmail() && checkPassword()) {
    alert("Account created successfully.");
    document.forms["signup"].submit();
    window.close();
    closeSignUp();
  } else {
    alert("Please fill out the full form before trying to submit");
  }
}

/* Opens pop-up form by setting form's display to 'block'
 * and both makePost and defaultText's display to 'none' */
function openForm() {
  document.getElementById("form").setAttribute('style', 'display:block !important');
  document.getElementById("makePost").style.display = "none";
  document.getElementById("defaultText").style.display = "none";
}

/* Closes pop-up form by setting form's display to 'none'
 *and both makePost and defaultTest's display to 'none' */
function closeForm() {
  document.getElementById("form").style.display = "none";
  document.getElementById("makePost").setAttribute('style', 'display:block !important');
  document.getElementById("defaultText").style.display = "block";
  refreshPage();
}

/* Google sign-in function.
 * Gets user's name and puts it in the navbar */
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var id_token = googleUser.getAuthResponse().id_token;
  document.getElementById("googleSignIn").setAttribute('style', 'display:none !important');
  document.getElementById("googleSignOut").setAttribute('style', 'display:block !important');
  document.getElementById("makePost").setAttribute('style', 'display:block !important');
  document.getElementById("welcome").innerHTML = "<h6 class=\"welcome\">Welcome, " + profile.getName() + " </h6>";
}

/* Google sign-out function.
 * Signs user out, hides the sign out button
 * and displays the sign in button again */
function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut();
  document.getElementById("welcome").innerHTML = null;
  document.getElementById("googleSignOut").style.display = "none";
  document.getElementById("makePost").style.display= "none";
  document.getElementById("googleSignIn").style.display = "block";
}

/* Event listeners */

// Add listener for search button
document.getElementById('search').addEventListener('click', searchPage);
