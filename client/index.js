/* Variable to store tokens recieved from server */
let token;

/* Variable for repeatedly calling setNavbarHeight */
let repeater;

/* Calls setNavbarHeight to begin loop */
setNavbarHeight();

/* Asynchronous function to update page with all users and messages.
 * Uses GET methods of server to recieve current list of messages,
 * it then iterates through them and inserts the final posts
 * in index.html */
async function refreshPage() {
  // Uses GET method 'messages' to receive list of messages
  let messagesResponse = await fetch("./messages");

  // Gets JSON in response body and parses it
  let messagesBody = await messagesResponse.text();
  let messagesPost = JSON.parse(messagesBody);

  // Only updates page with posts if they exist
  if (messagesPost.length > 0) {

    // Creates <ul> tag with id 'posts' in main body of HTML
    document.getElementById("content").innerHTML = "<ul id=\"posts\">";

    // Iterates through users and messages and produces forum posts using their information
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


/* Searches page asynchronously for posts with content matching query string.
 * Takes current query value, gets messages from the server and renders messages
 * that match. */
async function searchPage() {
  let query = document.getElementById("search").value;

  // Uses GET method 'messages' to receive list of messages
  let messagesResponse = await fetch("./messages");
  let messagesBody = await messagesResponse.text();

  // Parses JSON data received by GET method
  let messagesPost = JSON.parse(messagesBody);

  // New list to store messages matching the query
  var matchingMessages = [];

  // Iterates through (lower case versions of) all messages and finds matches
  for (let i = 0; i < messagesPost.length; i++) {
      if (messagesPost[i]["postedBy"].toLowerCase().includes(query) || messagesPost[i]["content"].toLowerCase().includes(query)) {
        // Pushes matches to matchingMessages
        matchingMessages.push(messagesPost[i]);
      }
  }

  // If any matching messages found, renders them on the messsage board
  if (matchingMessages.length > 0) {
    // Clears out message board area and initialises list of messages
    document.getElementById("content").innerHTML = "<ul id=\"posts\">";

    // Renders all posts in matchingMessages
    for (let i = 0; i < matchingMessages.length; i++) {

      document.getElementById("content").innerHTML +=
      `
      <li>
      <a>
      <div class="container-fluid">
        <div class="jumbotron post p-3 parent">
          <img src="images/default_user.jpeg" alt="user_icon" class="user">
          <div class="child inline-block-child p-3">
            <p>` + matchingMessages[i]["postedBy"] + `</p>
          </div>
          <div class="child inline-block-child date-text p-3">
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
    // Clears out message board area to show there were no matching results
    document.getElementById("content").innerHTML = null;
  }
}

/* Asynchronous function to add a message from 'make a post'
 * form to the message board area */
async function addMessage() {
  // Gets currently logged in user's name and submitted message
  let user = await document.getElementById("welcome").innerHTML.slice(29, -5);
  let message = await document.getElementById("message");

  // Uses post method addMessage to send message to the server with token for auth
  await $.ajax({
    type: "POST",
    url: "./addMessage",
    data: {postUsername: user, message: message.value},
    dataType: "json",
    beforeSend: function(request) {
      // Sends token only if it exists
      if (token) {
        request.setRequestHeader("x-access-token", token);
      }
    },
    success: (view_data) => {
      // If post was successful, closes sign up form, shows sign out button and alerts user
      alert(view_data["message"]);
      closeMessageForm();
      // Refreshes page to show message
      refreshPage();
    },
    error: (error) => {
      // If post was unsuccessful, shows reason for this in alert
      alert(error["responseJSON"]["message"]);
    }
  });
}

/* Checks if email inputs in sign up form are matching
 * and of a valid format */
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
  // Returns true if no issues found
  } else {
    return true;
  }
}

/* Checks if password inputs are matching */
function checkPassword() {
  // Gets email inputs and stores them in variables
  var password = document.getElementById("password").value;
  var confirmPassword = document.getElementById("confirmPassword").value;

  // Checks if password is blank
  if (password == "") {
    alert('Please enter a password');
    return false;
  // Checks if both input fields are equal
  } else if (password != confirmPassword) {
    alert('Inputted passwords do not match');
    return false;
  // Returns true if no issues found
  } else {
    return true;
  }
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
    await $.ajax({
      type: "POST",
      url: "./addUser",
      data: {username: username.value, email: email.value, password: password.value},
      dataType: "json",
      success: (view_data) => {
        // If post was successful, closes sign up form, stores response token and alerts user
        token = view_data["token"];
        closeSignUp();
        successfulSignIn(username.value);
        alert(view_data["message"]);
      },
      error: (error) => {
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
   await $.ajax({
    type: "POST",
    url: "./signIn",
    data: {signInUsername: signInUsername.value, signInPassword: signInPassword.value},
    dataType: "json",
    success: (view_data) => {
      // If post was successful, closes sign up form, calls successful sign in and alerts user
      token = view_data["token"];
      closeSignIn();
      successfulSignIn(signInUsername.value);
      alert(view_data["message"]);
    },
    error: (error) => {
      // If post was unsuccessful, shows reason for this in alert
      alert(error["responseJSON"]["message"]);
    }
  });
}

/* Calls post method signOut and alerts user to inform
 * them whether the sign out was successful */
async function signOut() {
  // Gets currently signed in user's username
  var user = document.getElementById("welcome").innerHTML.slice(29, -6);

  // Uses AJAX to sign out using token for auth
  await $.ajax({
    type: "POST",
    url: "./signOut",
    data: {user: user},
    dataType: "json",
    beforeSend: function(request) {
      // Sends token only if it exists
      if (token) {
        request.setRequestHeader("x-access-token", token);
      }
    },
    success: (view_data) => {
      // Destroys token to prevent protected methods from being called whilst logged out
      token = null;
      alert(view_data["message"]);
    },
    error: (error) => {
      // If post was unsuccessful, shows reason for this in alert
      alert(error["responseJSON"]["message"]);
    }
  });

  document.getElementById("signUpBar").style.display = "block";
  document.getElementById("signOut").style.display = "none";
  document.getElementById("googleSignIn").setAttribute('style', 'display:block !important');
  document.getElementById("makePost").setAttribute('style', 'display:none !important');
  document.getElementById("welcome").innerHTML = null;

}

/* Google sign-in function.
 * Gets user's name and puts it in the navbar */
async function googleSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var id_token = googleUser.getAuthResponse().id_token;

  // Signs user into server using ajax method
  await $.ajax({
    type: "POST",
    url: "./googleSignIn",
    data: {user: profile.getName()},
    dataType: "json",
    success: (view_data) => {
      token = view_data["token"];
      alert(view_data["message"]);
    },
    error: (error) => {
      // If post was unsuccessful, shows reason for this in alert
      alert(error["responseJSON"]["message"]);
    }
  });

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

  // Signs user out from server using ajax method
  await $.ajax({
    type: "POST",
    url: "./googleSignOut",
    data: {user: user},
    dataType: "json",
    success: (view_data) => {
      // Destroys token to prevent protected methods from being called whilst logged out
      token = null;
      successfulSignOut();
      alert(view_data["message"]);
    },
    error: (error) => {
      // If post was unsuccessful, shows reason for this in alert
      alert(error["responseJSON"]["message"]);
    }
  });
}


/* Opens sign up form by setting sign up form's display
 * to 'block' and sign in's display to 'none' */
function openSignUp() {
  document.getElementById("signup").setAttribute('style', 'display:block !important');
  document.getElementById("signin").style.display = "none";
}

/* Closes sign up form by setting sign up form's display
 * value to 'none' */
function closeSignUp() {
  document.getElementById("signup").setAttribute('style', 'display: none !important');
}

/* Opens sign in form by setting sign in form's display
 * to 'block', and sign up's display to 'none' */
function openSignIn() {
  document.getElementById("signin").setAttribute('style', 'display:block !important');
  document.getElementById("signup").style.display = "none";
}

/* Closes sign in form by setting sign in form's display
 * value to 'none' */
function closeSignIn() {
  document.getElementById("signin").setAttribute('style', 'display: none !important');
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

/* Sets the display qualities of items in the
 * navbar when a successful sign-in occurs. Takes
 * the user's username as a parameter to setup the
 * welcome bar at the top of the page */
function successfulSignIn(username) {
  document.getElementById("signUpBar").style.display = "none";
  document.getElementById("googleSignIn").setAttribute('style', 'display:none');
  document.getElementById("makePost").setAttribute('style', 'display:block !important');
  document.getElementById("signOut").setAttribute('style', 'display:block !important');
  document.getElementById("welcome").innerHTML = "<h6 class=\"welcome\">Welcome, " + username + " </h6>";
}

/* Sets the display qualities of items in the
 * navbar when a successful sign-out occurs */
function successfulSignOut() {
  document.getElementById("welcome").innerHTML = null;
  document.getElementById("googleSignOut").style.display = "none";
  document.getElementById("makePost").style.display= "none";
  document.getElementById("googleSignIn").style.display = "block";
  document.getElementById("signUpBar").style.display = "block";
}

/* Listens for a page refresh and signs the user out
 * using asynchronous function */
window.addEventListener('beforeunload', async () => {
  // Gets signedIn from server using token
  let signedInResponse = await fetch("./signedIn", {
    method: 'GET',
    headers: {
      'x-access-token': token
    }
  });
  let signedInBody = await signedInResponse.text();
  let signedInPost = JSON.parse(signedInBody);

  // Finds currently loggin in user's username
  let user = await document.getElementById("welcome").innerHTML.slice(29, -5);

  // Checks if user is already signed in
  if (signedInPost.includes(user)) {
    // Calls get method signOut with user in body and token for authentication
    await $.ajax({
      type: "POST",
      url: "./signOut",
      data: {user: user},
      dataType: "json",
      beforeSend: function(request) {
        // Sends token only if it exists
        if (token) {
          request.setRequestHeader("x-access-token", token);
        }
      },
      success: (view_data) => {
        // Destroys token to prevent protected methods from being called whilst logged out
        token = null;
        alert(view_data["message"]);
      },
      error: (error) => {
        // If post was unsuccessful, shows reason for this in alert
        alert(error["responseJSON"]["message"]);
      }
    });
  }
  // returnValue required for Google Chrome compatibility
  e.returnValue = '';
})

/* Adapts the height of message posts to appear below navbar
 * by checking header position every 500ms and adjusting content
 * position */
function setNavbarHeight() {
  $(document).ready( () => {
      // Gets position of header and stores it in contentPlacement
      let contentPlacement = $('#header').position().top + $('#header').height() - 50;
      if (contentPlacement >= 0) {
        // Sets content's padding-top CSS value to that stored in contentPlacement
        $('#content').css('padding-top', contentPlacement);
      } else {
        // Sets content's padding-top CSS value to 0
        $('#content').css('padding-top', 0);
      }
      // Repeats this check every 500ms
      repeater = setTimeout(setNavbarHeight, 500);
  });
}
