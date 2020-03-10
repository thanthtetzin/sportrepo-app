import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const SearchRepo = lazy(() => import('./components/SearchRepo/SearchRepo'));
const IssueDetail = lazy(() => import('./components/IssueDetail/IssueDetail'));

const httpLink = createHttpLink({
  uri: "https://api.github.com/graphql",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

const App = () => (
  <ApolloProvider client={client}>
    <Router>
      <div className="App">
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route exact path="/" component={SearchRepo}/>
            <Route path="/:type/:name/:reponame/issues/:number" component={IssueDetail}/>
          </Switch>
        </Suspense>
      </div>
    </Router>
  </ApolloProvider>
);

export default App;
