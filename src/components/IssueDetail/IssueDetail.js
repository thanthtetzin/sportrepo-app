import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Card
} from "react-bootstrap";
import {
  useParams
} from "react-router-dom";
import "../SearchRepo/SearchRepo.css";
import { FETCH_USERNAME_REPO_ISSUE_DETAILS, FETCH_ORG_REPO_ISSUE_DETAILS } from '../../graphQL-helpers/fetchRepoIssueDetailsQuery';
import { useQuery } from '@apollo/react-hooks';



function IssueDetail(){
  let [ isLoading, setIsLoading ] = useState(false);
  let [ queryError, setQueryError ] = useState('');
  let [ result, setResult ] = useState(null);
  const { type, name, reponame: repoName, number } = useParams();
  const typeNameCorrect = ['user','org'].includes(type);
  const orgName = name;
  const username = name;
  const issueNumber = parseInt(number);

  const fetchRepoIssueDetails_CallBack = (error, loading, data) => {
    if (data) {
      console.log('Returned data: ' , data);
      result = data;
      isLoading=false;
    }
    if(error){
      console.log('Error: ' , error);
      queryError = error;
      isLoading=false;
    }
    if(loading){
      isLoading=true;
    }
  }
  
  const { error: orgRepoIssueError, loading: orgRepoIssueLoading, data: orgRepoIssueData } = useQuery(FETCH_ORG_REPO_ISSUE_DETAILS, {
    variables: { orgName, repoName, issueNumber },
    skip: !typeNameCorrect || type==='user'
  });
  const { error: userRepoIssueError, loading: userRepoIssueLoading, data: userRepoIssueData } = useQuery(FETCH_USERNAME_REPO_ISSUE_DETAILS, {
    variables: { username, repoName, issueNumber },
    skip: !typeNameCorrect || type==='org'
  });
  fetchRepoIssueDetails_CallBack(orgRepoIssueError, orgRepoIssueLoading, orgRepoIssueData);
  fetchRepoIssueDetails_CallBack(userRepoIssueError, userRepoIssueLoading, userRepoIssueData);

  const alertInfo = (variant, message) => {
    return <Container>
        <Row>
          <Col>
            <Alert variant={variant}>
              <p dangerouslySetInnerHTML={{ __html: message}}></p>
            </Alert>
          </Col>
        </Row>
      </Container>;
  }
  let issueDetail = null;
  if(typeNameCorrect){
    if(isLoading){
      issueDetail = <Spinner className="spinner" animation="border" variant="success" />;
    } else if(queryError && !result){
      issueDetail = alertInfo("danger", 'Error: ' + queryError.message);
    } else if(!isLoading && result){
      console.log('Got result: ', result);
    }
  } else {
    issueDetail = alertInfo("danger", 'The url parameters are not correct to fetch the data');
  }
  return issueDetail;
}

export default IssueDetail;
