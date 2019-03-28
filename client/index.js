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

/* Checks whether current inputted information can be
 * found in existsing user accounts */
async function checkAccount() {
  // Gets username and email from form
  var username = await document.getElementById("username").value;
  var email = await document.getElementById("email").value;

  // Fetches existing users' information and formats it to JSON
  let usersResponse = await fetch("http://127.0.0.1:8090/users");
  let usersBody = await usersResponse.text();
  let usersJSON = JSON.parse(usersBody);

  // Loops through all users returned to usersResponse
  for (let i = 0; i < usersJSON.length; i++) {

    // Checks if user's username matches that in the form
    if (usersJSON[i]["username"] == username) {
      // Alerts user that the username is taken and returns false
      alert("An account with that username already exists");
      return false;
    // Checks if user's email matches that in the form
    } else if (usersJSON[i]["email"] == email) {
      // Alerts user that the email is taken and returns false
      alert("An account with that email address already exists");
      return false;
    }
  }

  // If no issues found, closes the form, adjusts the items in the navbar and returns true
  successfulSignIn();
  return true;

}

/* Checks if user with inputted username or email exists */
async function checkUsernameEmail() {
  // Gets input from sign in form
  var usernameEmail = await document.getElementById("usernameEmail").value;

  // Fetches existing users' information and formats it to JSON
  let usersResponse = await fetch("http://127.0.0.1:8090/users");
  let usersBody = await usersResponse.text();
  let usersJSON = JSON.parse(usersBody);

  // Loops through all users returned to usersResponse
  for (let i = 0; i < usersJSON.length; i++) {
    // Checks if user's username matches that in the form
    if (usersJSON[i]["username"] == usernameEmail) {
      return true;
    } else if (usersJSON[i]["email"] == usernameEmail) {
      return true;
    }
  }

  // If not, returns false
  return false;
}

async function checkSignedIn() {

  username = document.getElementById("usernameEmail").value

  // Gets signedIn from server
  let signedInResponse = await fetch("http://127.0.0.1:8090/signedIn");
  let signedInBody = await signedInResponse.text();
  let signedInPost = JSON.parse(signedInBody);

  // Checks that user is in signedIn
  if (signedInPost.includes(username)) {
    return true;
  } else {
    return false;
  }
}

/* Checks if email inputs are matching */
function checkEmail() {
  // Gets email inputs and stores them in variables
  var email = document.getElementById("email").value;
  var confirmEmail = document.getElementById("confirmEmail").value;

  // Checks if email has been left blank, if so gives an alert and returns false
  if (email == "") {
    alert("Please enter an email");
    return false;
  // Checks if email and confirmation email are matching
  } else if (email != confirmEmail) {
    alert("Inputted emails do not match");
    return false;
  // Uses regex to determine whether the email is in a valid format
  } else if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    alert("Please enter a valid email address");
    return false;
  } else {
    return true;
  }
}

/* Checks if password inputs are matching */
function checkPassword() {
  // Gets email inputs and stores them in variables
  var password = document.getElementById("password").value;
  var confirmPassword = document.getElementById("confirmPassword").value;

  // Checks if both input fields are equal
  if (password != confirmPassword) {
    alert('Inputted passwords do not match');
    return false;
  } else if (password == "") {
    alert('Please enter a password');
    return false;
  } else {
    return true;
  }
}

/* Opens pop-up form by setting sign up form's display
 * to 'block' and both sign in & defaultTexts' display to 'none' */
function openSignUp() {
  document.getElementById("signup").setAttribute('style', 'display:block !important');
  document.getElementById("defaultText").style.display = "none";
  document.getElementById("signin").style.display = "none";
}

/* Opens pop-up form by setting sign in form's display
 * to 'block', and both sign up & defaultTexts' display to 'none' */
function openSignIn() {
  document.getElementById("signin").setAttribute('style', 'display:block !important');
  document.getElementById("defaultText").style.display = "none";
  document.getElementById("signup").style.display = "none";
}

/* Closes pop-up form by setting sign up form's display
 * value to 'none' */
function closeSignUp() {
  document.getElementById("signup").setAttribute('style', 'display: none !important');
}

/* Closes pop-up form by setting sign up form's display
 * value to 'none' */
async function closeSignIn() {
  // Checks if the sign in was a success
  response = await checkSignedIn();
  // Sets up the page appropriately
  if (response) {
    signedInSetup();
  }
  document.getElementById("signin").setAttribute('style', 'display: none !important');
}

/* Adds welcome banner on non-google sign in
 * and removes sign up and sign in buttons */
function signedInSetup() {
  document.getElementById("welcome").innerHTML = "<h6 class=\"welcome\">Welcome, " + document.getElementById("usernameEmail").value + " </h6>";
  document.getElementById("signUpBar").style.display = "none";
  document.getElementById("googleSignIn").setAttribute('style', 'display:none');
}

/* Submits sign up form if information is valid and
 * creates an alert appropriate to the outcome. */
async function submitSignUp() {
  // Sets accountFree to boolean value returned by checkAccount
  let accountFree = await checkAccount();

  // Checks if inputted values already correspond to an existing user
  // and checks if the inputted emails and passwords are valid
  if (accountFree && checkEmail() && checkPassword()) {
    // Submits form and informs user that the account creation was successful, then closes the form
    document.forms["signup"].submit();
    alert("Account created successfully.");
    closeSignUp();
  }
}

/* Submits sign in form if information is valid and
 * creates an alert appropriate to the outcome. */
async function submitSignIn() {
  // Sets usernameEmail to the results of calling checkUsernameEmail
  let usernameEmail = await checkUsernameEmail();

  // Checks if inputted values correspond to an existing user and their password
  if (usernameEmail) {
    // Submits form and informs user that the account creation was successful, then closes the form
    document.forms["signin"].submit();
  }
  // If username is incorrect, alerts user
  else {
    alert("No account with that username or email address exists");
  }
}

/* Sets the display qualities of items in the
 * navbar when a successful sign-in occurs */
function successfulSignIn() {
  document.getElementById("signUpBar").style.display = "none";
  document.getElementById("googleSignIn").setAttribute('style', 'display:none !important');
  document.getElementById("makePost").setAttribute('style', 'display:block !important');
}

/* Opens pop-up message form by setting form's display to 'block'
 * and both makePost and defaultText's display to 'none' */
function openMessageForm() {
  document.getElementById("form").setAttribute('style', 'display:block !important');
  document.getElementById("makePost").style.display = "none";
  document.getElementById("defaultText").style.display = "none";
  document.getElementById("signUpBar").style.display = "none";
}

/* Closes pop-up message form by setting form's display to 'none'
 * and both makePost and defaultTest's display to 'none' */
function closeMessageForm() {
  document.getElementById("form").style.display = "none";
  document.getElementById("makePost").setAttribute('style', 'display:block !important');
  refreshPage();
}

/* Google sign-in function.
 * Gets user's name and puts it in the navbar */
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var id_token = googleUser.getAuthResponse().id_token;
  document.getElementById("googleSignOut").setAttribute('style', 'display:block !important');
  document.getElementById("welcome").innerHTML = "<h6 class=\"welcome\">Welcome, " + profile.getName() + " </h6>";
  // Adjusts items in navbar to inform the user they are signed in
  successfulSignIn();
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
