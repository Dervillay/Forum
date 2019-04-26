# Forum
A dynamic forum website. Online version here: https://forumprogproject.herokuapp.com

## Notes for Users
Forum allows you to post, view and search for messages. 
A user may create their own account by clicking 'Sign up' or log in to an existing account using 'Sign in'.
The option for signing in with Google also exists for users not wishing to make an account, but still wanting access to the Forum service.

Once signed in, the user can press 'Make a post' to submit whatever they're feeling to the forum, which will appear for all visitors to the site.

If at any point a user wishes to sign out, then they may do so easily by clicking the 'Sign out' button, which works regardless of whether they are logged in to a regular account or Google.

At any point, whether logged in or not, a user may use the search bar to narrow down the messages that are displayed. The search query is matched against both the usernames of people who have submitted the messages and the content of the messages themselves.

## Features
- Google sign in compatability (online version only).
- JavaScript Web Token authentication (users are sent tokens on sign in/sign up that last 24 hours, authorising them to make posts and get information about users and messages via requests to the API).
- Welcome bar adapts to each individual user, whether signed in via Google or regularly.
- Search bar allows filtering and listing of messages and users via requests to the API.
- The client-side service handles disconnection to the server by responding with appropriate alerts, ensuring that the user is always informed as to the state of the Forum service.
- Users are automatically signed out of the forum on a page refresh, providing security, as users forgetting to sign out manually will automatically have it done upon closing their browser.
- On a sign out the stored JavaScript Web Token is destroyed, preventing the abuse of tokens to access what may be private user information by someone without an account or authorisation.
