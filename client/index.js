/* Variable to store tokens recieved from server */
let token;

/* Asynchronous function to update page with all users and messages.
 * Uses GET methods of server to recieve current list of users and
 * messages. It then iterates through them and inserts the final posts
 * in index.html */
async function refreshPage() {
  // Uses GET method 'messages' to receive list of messages using token
  let messagesResponse = await fetch("http://127.0.0.1:8090/messages", {
    method: 'get',
    headers: {
      'x-access-token': token
    }
  });
  let messagesBody = await messagesResponse.text();
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
      <div class=\"container-fluid\">
        <div class=\"jumbotron post p-3 parent\">
          <img src=\"images/default_user.jpeg\" alt=\"user_icon\" class=\"user\">
          <div class=\"child inline-block-child p-3\">
            <p>` + messagesPost[i]["postedBy"] + `</p>
          </div>
          <div class=\"child inline-block-child date-text p-3\">
            <p>Posted ` + messagesPost[i]["datePosted"] + `</p>
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
  // Submits sendQuery post request with token
  await $.ajax({
    type: "POST",
    url: "http://127.0.0.1:8090/sendQuery",
    data: {query: query.value},
    dataType: "json",
    beforeSend: function(request) {
      request.setRequestHeader("x-access-token", token);
    },
    error: function(error) {
      alert(error["responseJSON"]["message"]);
    }
  });

  // Uses GET method 'messages' to receive list of messages using token
  let messagesResponse = await fetch("http://127.0.0.1:8090/messages", {
    method: 'get',
    headers: {
      'x-access-token': token
    }
  });
  let messagesBody = await messagesResponse.text();

  // Uses GET method 'query' to receive search query using token
  let queryResponse = await fetch("http://127.0.0.1:8090/query", {
    method: 'get',
    headers: {
      'x-access-token': token
    }
  });
  let queryBody = await queryResponse.text();

  // Parses data received by GET methods into JS objects
  let messagesPost = JSON.parse(messagesBody);
  let queryPost = JSON.parse(queryBody)

  // New list to store users and messages matching the query
  var matchingMessages = []

  // Iterates through (lower case versions of) all users and messages and finds matches
  for (let i = 0; i < messagesPost.length; i++) {
      if (messagesPost[i]["postedBy"].toLowerCase().includes(queryPost["result"]) || messagesPost[i]["content"].toLowerCase().includes(queryPost["result"])) {
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
      <div class=\"container-fluid\">
        <div class=\"jumbotron post p-3 parent\">
          <img src=\"images/default_user.jpeg\" alt=\"user_icon\" class=\"user\">
          <div class=\"child inline-block-child p-3\">
            <p>` + matchingMessages[i]["postedBy"] + `</p>
          </div>
          <div class=\"child inline-block-child date-text p-3\">
            <p>Posted ` + matchingMessages[i]["datePosted"] + `</p>
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

async function addMessage() {
  // Gets currently logged in user's name and submitted message
  let user = await document.getElementById("welcome").innerHTML.slice(29, -5);
  let message = await document.getElementById("message");

  $.ajax({
    type: "POST",
    url: "http://127.0.0.1:8090/addMessage",
    data: {postUsername: user, message: message.value},
    dataType: "json",
    beforeSend: function(request) {
      request.setRequestHeader("x-access-token", token);
    },
    success: function(view_data) {
      // If post was successful, closes sign up form, shows sign out button and alerts user
      alert(view_data["message"]);
      closeMessageForm();
      refreshPage();
    },
    error: function(error) {
      alert(error["responseJSON"]["message"]);
    }
  });
}

async function checkSignedIn() {

  let username = document.getElementById("signInUsername").value;

  // Gets signedIn from server using token
  let signedInResponse = await fetch("http://127.0.0.1:8090/signedIn", {
    method: 'get',
    headers: {
      'x-access-token': token
    }
  });
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
  document.getElementById("signin").style.display = "none";
}

/* Opens pop-up form by setting sign in form's display
 * to 'block', and both sign up & defaultTexts' display to 'none' */
function openSignIn() {
  document.getElementById("signin").setAttribute('style', 'display:block !important');
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
  // Closes sign in form
  document.getElementById("signin").setAttribute('style', 'display: none !important');
}

/* Submits sign up form if information is valid and
 * creates an alert appropriate to the outcome. */
async function submitSignUp() {
  // Checks if the inputted emails and passwords are valid
  if (checkEmail() && checkPassword()) {

    // Gets all data in the HTML form and stores it in a variable
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
      success: function(view_data) {
        // If post was successful, closes sign up form, stores response token and alerts user
        token = view_data["token"];
        closeSignUp();
        successfulSignIn(username.value);
        alert(view_data["message"]);
      },
      error: function(error) {
        // If post was unsuccessful, shows reason for this in alert
        alert(error["responseJSON"]["message"]);
      }
    });
  }
}

/* Submits sign in form if information is valid and
 * creates an alert appropriate to the outcome. */
async function submitSignIn() {
  let signInUsername = document.getElementById("signInUsername");
  let signInPassword = document.getElementById("signInPassword");
  // Submits form and informs user that the account creation was successful, then sets up page appropriately
  $.ajax({
    type: "POST",
    url: "http://127.0.0.1:8090/signIn",
    data: {signInUsername: signInUsername.value, signInPassword: signInPassword.value},
    dataType: "json",
    success: function(view_data) {
      // If post was successful, closes sign up form, shows sign out button and alerts user
      token = view_data["token"];
      closeSignIn();
      successfulSignIn(signInUsername.value);
      alert(view_data["message"]);
    },
    error: function(error) {
      // If post was unsuccessful, shows reason for this in alert
      alert(error["responseJSON"]["message"]);
    }
  });
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
function successfulSignIn(username) {
  document.getElementById("signUpBar").style.display = "none";
  document.getElementById("googleSignIn").setAttribute('style', 'display:none');
  document.getElementById("makePost").setAttribute('style', 'display:block !important');
  document.getElementById("signOut").setAttribute('style', 'display:block !important');
  document.getElementById("welcome").innerHTML = "<h6 class=\"welcome\">Welcome, " + username + " </h6>";
}

/* Opens pop-up message form by setting form's display to 'block'
 * and both makePost and defaultText's display to 'none' */
function openMessageForm() {
  document.getElementById("messageForm").setAttribute('style', 'display:block !important');
  document.getElementById("makePost").style.display = "none";
  document.getElementById("signUpBar").style.display = "none";
}

/* Closes pop-up message form by setting form's display to 'none'
 * and both makePost and defaultTest's display to 'none' */
function closeMessageForm() {
  document.getElementById("messageForm").style.display = "none";
  document.getElementById("makePost").setAttribute('style', 'display:block !important');
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
  document.getElementById("googleSignIn").setAttribute('style', 'display:none');
  document.getElementById("googleSignOut").setAttribute('style', 'display:block !important');
  document.getElementById("makePost").setAttribute('style', 'display:block !important');
  document.getElementById("signUpBar").style.display = "none";
  document.getElementById("signin").style.display = "none";
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

/* Listens for a page refresh and signs the user out
 * using asynchronous function */
window.addEventListener('beforeunload', async function(e) {
  // Gets signedIn from server
  let signedInResponse = await fetch("http://127.0.0.1:8090/signedIn");
  let signedInBody = await signedInResponse.text();
  let signedInPost = JSON.parse(signedInBody);

  // Finds currently loggin in user's username
  if (document.getElementById("username").value != '') {
    var user = document.getElementById("username").value;
  } else if (document.getElementById("signInUsername").value != '') {
    var user = document.getElementById("signInUsername").value;
  }

  // Checks if user is already signed in
  if (signedInPost.includes(user)) {
    // Calls get method signOut with user as parameter
    await fetch('http://127.0.0.1:8090/signOut/' + user);
  }

  // returnValue reuired for Google Chrome
  e.returnValue = '';
})

// Variable for repeatedly calling setNavbarHeight
let repeater;

/* Adapts the height of message posts to appear below navbar */
function setNavbarHeight() {
  $(document).ready(function() {
      const contentPlacement = $('#header').position().top + $('#header').height() - 50;
      if (contentPlacement >= 0) {
        $('#content').css('padding-top', contentPlacement);
      } else {
        $('#content').css('padding-top', 0);
      }
      repeater = setTimeout(setNavbarHeight, 500);
  });
}

/* Calls setNavbarHeight to begin loop */
setNavbarHeight();
