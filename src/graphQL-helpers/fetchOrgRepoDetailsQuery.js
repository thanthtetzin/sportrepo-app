import gql from 'graphql-tag';
const FETCH_ORG_REPO_DETAILS = gql`
  query fetchOrgRepos($orgName: String!, $repoName: String!, 
    $fetchPR: Boolean!, $fetchPROrderBy : String!, $fetchPRSortDirection: String!,
    $fetchOpenedIssue: Boolean!, $fetchOpenedIssueOrderBy : String!, $fetchOpenedIssueSortDirection: String!,
    $fetchClosedIssue: Boolean!, $fetchClosedIssueOrderBy : String!, $fetchClosedIssueSortDirection: String!,
    ) {
    organization(login: $orgName){
      name,
      url,
      repository(name: $repoName){
        name,
        url,
        pullRequests(first:10, states:OPEN, orderBy: {field: $fetchPROrderBy, direction: $fetchPRSortDirection}) @include(if: $fetchPR){
          nodes{
            number,
            author{login},
            title,
            createdAt
          }
        },
        openedIssues:issues(first:10, states:OPEN, orderBy: {field: $fetchOpenedIssueOrderBy, direction: $fetchOpenedIssueSortDirection}) @include(if: $fetchOpenedIssue){
          nodes{
            number,
            author{login},
            title,
            createdAt
          }
        },
        closedIssues:issues(first:10, states:CLOSED, orderBy: {field: $fetchClosedIssueOrderBy, direction: $fetchClosedIssueSortDirection}) @include(if: $fetchClosedIssue){
          nodes{
            number,
            author{login},
            title,
            createdAt
          }
        },
        
      }
    }
  }
`;

export default FETCH_ORG_REPO_DETAILS;