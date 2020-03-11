import gql from 'graphql-tag';
export const FETCH_USERNAME_REPO_ISSUE_DETAILS = gql`
  query fetchUserRepoIssue($username: String!, $repoName: String!, $issueNumber: Int!) {
    username:user(login: $username){
      name,
      url,
      repository(name: $repoName){
        name,
        url,
        issue(number: $issueNumber){
          id,
          number,
          author{login},
          title,
          createdAt,
          body,
          bodyHTML,
          bodyText,
          closed,
          comments(first: 10){
            nodes{
              id,
              author{login},
              createdAt,
              bodyHTML,
              bodyText
            }
          }
          
        }
      }
    }
  }
`;
export const FETCH_ORG_REPO_ISSUE_DETAILS = gql`
  query fetchOrgRepoIssue($orgName: String!, $repoName: String!, $issueNumber: Int!) {
    organization(login: $orgName){
      name,
      url,
      repository(name: $repoName){
        name,
        url,
        issue(number: $issueNumber){
          id,
          number,
          author{login},
          title,
          createdAt,
          body,
          bodyHTML,
          bodyText,
          closed,
          comments(first: 10){
            nodes{
              id,
              author{login},
              createdAt,
              bodyHTML,
              bodyText
            }
          }
          
        }
      }
    }
  }
`;
