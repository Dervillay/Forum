/* Asynchronous function to update page with all users and messages.
 * Uses GET methods of server to recieve current list of users and
 * messages. It then iterates through them and inserts the final posts
 * in index.html */
async function refreshPage() {
  // Uses GET method 'messages' to receive list of messages
  let messagesResponse = await fetch("http://127.0.0.1:8090/messages");
  let messagesBody = await messagesResponse.text();

  // Parses data received by GET method
  let messagesPost = JSON.parse(messagesBody);

  // Only updates page with posts if they exist
  if (messagesPost.length > 0) {

    // Creates <ul> tag with id 'posts' in main body of HTML
    document.getElementById("content").innerHTML = "<ul id=\"posts\">";

    // Iterates through users and messages and prduces forum posts using their information
    for (let i = 0; i < messagesPost.length; i++) {
      document.getElementById("content").innerHTML +=
      `
      <li>
      <a>
      <div class=\"container-fluid container-user\">
        <div class=\"jumbotron post p-3 parent\">
          <img src=\"images/default_user.jpeg\" alt=\"user_icon\" class=\"user\">
          <div class=\"child inline-block-child p-3\">
            <p>` + messagesPost[i]["postedBy"] + `</p>
          </div>
          <div class="child inline-block-child date-text p-3">
            <p class="date-text">` + messagesPost[i]["datePosted"] + `</p>
          </div>
          <div class="jumbotron comment p-3">
            ` + messagesPost[i]["content"] + `
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
  let query = document.getElementById("search");
  // Submits form
  // SORT AJAX HERE
  $.post("http://127.0.0.1:8090/sendQuery", {query: search.value});

  // Uses GET method 'messages' to receive list of messages
  let messagesResponse = await fetch("http://127.0.0.1:8090/messages");
  let messagesBody = await messagesResponse.text();

  // Uses GET method 'query' to receive search query
  let queryResponse = await fetch("http://127.0.0.1:8090/query");
  let queryBody = await queryResponse.text();

  // Parses data received by GET methods into JS objects
  let messagesPost = JSON.parse(messagesBody);

  // New list to store users and messages matching the query
  var matchingMessages = []

  // Iterates through (lower case versions of) all users and messages and finds matches
  for (let i = 0; i < messagesPost.length; i++) {
      if (messagesPost[i]["postedBy"].toLowerCase().includes(queryBody) || messagesPost[i]["content"].toLowerCase().includes(queryBody)) {
        matchingMessages.push(messagesPost[i]);
      }
  }

  if (matchingMessages.length > 0) {
    // Clears out message board area and initialises list of messages
    document.getElementById("content").innerHTML = "<ul id=\"posts\">";

    // Iterates and updates all posts in matching lists
    for (let i = 0; i < matchingMessages.length; i++) {

      document.getElementById("content").innerHTML +=
      `
      <li>
      <a>
      <div class=\"container-fluid container-user\">
        <div class=\"jumbotron post p-3 parent\">
          <img src=\"images/default_user.jpeg\" alt=\"user_icon\" class=\"user\">
          <div class=\"child inline-block-child p-3\">
            <p>` + matchingMessages[i]["postedBy"] + `</p>
          </div>
          <div class="child inline-block-child date-text p-3">
            <p class="date-text">` + matchingMessages[i]["datePosted"] + `</p>
          </div>
          <div class="jumbotron comment p-3">
            ` + matchingMessages[i]["content"] + `
          </div>
        </div>
      </div>
      </a>
      </li>
      `
    };
    document.getElementById("content").innerHTML += "</ul>";
  } else {
    // Clears out message board area
    document.getElementById("content").innerHTML = null;
  }
}

function postMessage() {
  var user = document.getElementById("welcome").innerHTML.slice(29, -5);

  document.getElementById("postUsername").value = user;


  document.forms["signup"].submit();
  alert("Post submitted successfully.");
  closeMessageForm();
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
async function checksignInUsername() {
  // Gets input from sign in form
  var signInUsername = await document.getElementById("signInUsername").value;

  // Fetches existing users' information and formats it to JSON
  let usersResponse = await fetch("http://127.0.0.1:8090/users");
  let usersBody = await usersResponse.text();
  let usersJSON = JSON.parse(usersBody);

  // Loops through all users returned to usersResponse
  for (let i = 0; i < usersJSON.length; i++) {
    // Checks if user's username matches that in the form
    if (usersJSON[i]["username"] == signInUsername) {
      return true;
    } else if (usersJSON[i]["email"] == signInUsername) {
      return true;
    }
  }

  // If not, returns false
  return false;
}

async function checkSignedIn() {

  username = document.getElementById("signInUsername").value;

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
    successfulSignIn();
  }

  // Closes sign in form
  document.getElementById("signin").setAttribute('style', 'display: none !important');
}

/* Submits sign up form if information is valid and
 * creates an alert appropriate to the outcome. */
async function submitSignUp() {
  // Sets accountFree to boolean value returned by checkAccount
  let accountFree = await checkAccount();

  // Checks if inputted values already correspond to an existing user
  // and checks if the inputted emails and passwords are valid
  if (accountFree && checkEmail() && checkPassword()) {

    // Gets all data in the HTML form and stores it in variable
    let username = document.getElementById("username");
    let email = document.getElementById("email");
    let confirmEmail = document.getElementById("confirmEmail");
    let password = document.getElementById("password");
    let confirmPassword = document.getElementById("confirmPassword");

    // Uses AJAX to post this data to the server and handles the response on success
    $.ajax({
      type: "POST",
      url: "http://127.0.0.1:8090/addUser",
      data: {username: username.value, email: email.value, password: password.value},
      dataType: "json",
      success: function(response_data_json) {
        // Gets response data from post request and checks for success
        view_data = response_data_json;
        // If post was successful, closes sign up form, shows sign out button and alerts user 
        if (view_data["status"] == "success") {
          closeSignUp();
          document.getElementById("signOut").setAttribute('style', 'display:block !important');
          alert("Account created successfully");
        } else {
          alert("Account creation was unsuccessful, please try again");
        }
      }
    });
  }
}

/* Submits sign in form if information is valid and
 * creates an alert appropriate to the outcome. */
async function submitSignIn() {
  // Sets signInUsername to the results of calling checksignInUsername
  let signInUsername = await checksignInUsername();

  // Checks if inputted values correspond to an existing user and their password
  if (signInUsername) {

    let signInUsername = document.getElementById("signInUsername");
    let signInPassword = document.getElementById("signInPassword");
    // Submits form and informs user that the account creation was successful, then sets up page appropriately
    $.post("http://127.0.0.1:8090/signIn", {signInUsername: signInUsername.value, signInPassword: signInPassword.value});
  }
  // If username is incorrect, alerts user
  else {
    alert("No account with that username or email address exists");
  }
}

/* Calls get method signOut and stores the response to check
 * whether the sign out was successful */
async function signOut() {
  // Grabs current user's username from sign in or sign up form
  if (document.getElementById("username").value != '') {
    var user = document.getElementById("username").value;
  } else if (document.getElementById("signInUsername").value != '') {
    var user = document.getElementById("signInUsername").value;
  }
  // Calls get method signOut with user as parameter
  await fetch('http://127.0.0.1:8090/signOut/' + user);

  document.getElementById("signUpBar").style.display = "block";
  document.getElementById("signOut").style.display = "none";
  document.getElementById("googleSignIn").setAttribute('style', 'display:block !important');
  document.getElementById("makePost").setAttribute('style', 'display:none !important');
  document.getElementById("welcome").innerHTML = null;

}

/* Sets the display qualities of items in the
 * navbar when a successful sign-in occurs */
function successfulSignIn() {
  document.getElementById("signUpBar").style.display = "none";
  document.getElementById("googleSignIn").setAttribute('style', 'display:none');
  document.getElementById("makePost").setAttribute('style', 'display:block !important');
  document.getElementById("signOut").setAttribute('style', 'display:block !important');
  document.getElementById("welcome").innerHTML = "<h6 class=\"welcome\">Welcome, " + document.getElementById("username").value; + " </h6>";
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
async function googleSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var id_token = googleUser.getAuthResponse().id_token;

  // Signs user in using get method
  await fetch("http://localhost:8090/googleSignIn/" + profile.getName());

  // Sets up items in navbar to inform user they are signed in
  document.getElementById("welcome").innerHTML = "<h6 class=\"welcome\">Welcome, " + profile.getName() + " </h6>";
  document.getElementById("googleSignOut").setAttribute('style', 'display:block !important');
  document.getElementById("signUpBar").style.display = "none";
  document.getElementById("googleSignIn").setAttribute('style', 'display:none');
  document.getElementById("makePost").setAttribute('style', 'display:block !important');
}

/* Google sign-out function.
 * Signs user out, hides the sign out button
 * and displays the sign in button again */
async function googleSignOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut();

  // Gets currently signed in user's username
  var user = document.getElementById("welcome").innerHTML.slice(29, -6);

  // Signs user out using get method
  await fetch("http://localhost:8090/googleSignOut/" + user);

    // Sets up items in navbar to inform user they are signed out
  document.getElementById("welcome").innerHTML = null;
  document.getElementById("googleSignOut").style.display = "none";
  document.getElementById("makePost").style.display= "none";
  document.getElementById("googleSignIn").style.display = "block";
  document.getElementById("signUpBar").style.display = "block";
}

/* Listens for a page refresh and signs the user out */
window.addEventListener('beforeunload', async function(e) {
  // Cancels the user prompt event
  e.preventDefault();

  // Finds currently loggin in user's username
  if (document.getElementById("username").value != '') {
    var user = document.getElementById("username").value;
  } else if (document.getElementById("signInUsername").value != '') {
    var user = document.getElementById("signInUsername").value;
  }
  // Calls get method signOut with user as parameter
  await fetch('http://127.0.0.1:8090/signOut/' + user);

  // returnValue reuired for users using chrome
  e.returnValue = '';
})
