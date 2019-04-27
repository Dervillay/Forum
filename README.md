# Forum
A dynamic forum website. Online version here: https://forumprogproject.herokuapp.com.

For in-depth documentation of the actual JavaScript code and API (index.js and app.js) check `global.html` in the `documentation` folder.

## Notes for Users
Forum allows you to post, view and search for messages. 
A user may create their own account by clicking 'Sign up' or log in to an existing account using 'Sign in'.
The option for signing in with Google also exists for users not wishing to make an account, but still wanting access to the Forum service.

Once signed in, the user can press 'Make a post' to submit whatever they're feeling to the forum, which will appear for all visitors to the site.

All messages submitted to the forum can be viewed by clicking the Forum logo in the top left-hand corner of the page.

If at any point a user wishes to sign out, then they may do so easily by clicking the 'Sign out' button, which works regardless of whether they are logged in to a regular account or Google.

At any point, whether logged in or not, a user may use the search bar to narrow down the messages that are displayed. The search query is matched against both the usernames of people who have submitted the messages and the content of the messages themselves.

## Features
- Google sign in compatability (online version only).

- Forum scales dynamically to a range of viewport sizes and phone displays, making it mobile-friendly.

- JavaScript Web Token authentication (users are sent tokens on sign in/sign up that last 24 hours, authorising them to make posts and get information about users and messages via requests to the API).

- Welcome bar adapts to each individual user, whether signed in via Google or regularly.

- Search bar allows filtering and listing of messages and users via requests to the API.

- Messages include the exact date and time they were posted

- The server console receives updates whenever a user creates an account, logs in, or logs out (whether Google was used to do so is also specified).

- The client-side service handles disconnection to the server by responding with appropriate alerts, ensuring that the user is always informed as to the state of the Forum service.

- Users are automatically signed out of the forum on a page refresh, providing security, as users forgetting to sign out manually will automatically have it done upon closing their browser.

- On a sign out the stored JavaScript Web Token is destroyed, preventing the abuse of tokens to access what may be private user information by someone without an account or authorisation.

## Scripts and Testing
- `npm install` - installs the API and its dependencies.

- `npm start` - starts the server.

- `npm run pretest` - ESLints the files `app.js`, `server.js` and `index.js`.

- `npm test` - jest tests the API by running the tests specified in `app.test.js`, also calling `npm pretest` before running.

- `^C` - at any point in the server console will shut down the server. The server will handle this appropriately and upon trying to make requests, the client-side page will report that it is unable to connect to the server.

## Additional Notes
- A secret for generating JavaScript Web Tokens has been included in the config.js file. This is not standard procedure, as typically secrets are stored locally, away from users and are just that, secret. The inclusion of this secret is just for demonstration purposes and to allow an instance of Forum to run using tokens.

- The Google sign in client ID has been removed from the local version since a.) It is against Google's terms and services to disclose it, and b.) the Google sign in feature does not work when running the Forum service locally. To combat this, the fully working implementation with Google sign in has been provided in the online verison [here](https://forumprogproject.herokuapp.com).
