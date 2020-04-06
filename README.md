This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### This app is about
- An React app that is communicating with GraphQL API v4 of GitHub
- You can search any git repository of a user or organization in the app. When you search the repo, you will be able to see the Pull Requests, Opened/Closed Issues List (First 10 records for each) in tabs view.
- When you click Open or Close Issue, you will be redirect to the issue detail with the comments (First 10 records). And you will be able to filter the comments.

### Requirements to search the repo of organization or user
- You will need your own personal access token which can generate in you github user account (Settings > Developer Settings > Personal access tokens > Generate new token > Select Scopes > check all "repo" and "admin:org" > Click "Generate token" > Keep your token to use in the app)

### This app is implemented by using
- React hooks, React Router DOM, React Bootstrap, Moment Js and Apollo Client.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
