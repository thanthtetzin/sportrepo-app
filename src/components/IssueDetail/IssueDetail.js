import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Badge,
  InputGroup,
  FormControl,
  Card
} from "react-bootstrap";
import {
  useParams
} from "react-router-dom";
import "../SearchRepo/SearchRepo.css";
import { FETCH_USERNAME_REPO_ISSUE_DETAILS, FETCH_ORG_REPO_ISSUE_DETAILS } from '../../graphQL-helpers/fetchRepoIssueDetailsQuery';
import { useQuery } from '@apollo/react-hooks';
import moment from 'moment';

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

function IssueDetail(){
  console.log('start')
  let [ isLoading ] = useState(false);
  let [ queryError ] = useState('');
  let [ result ] = useState(null);
  let [ filterValue, setFilterValue ] = useState('');
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

  let dataToRender = null;
  if(typeNameCorrect){
    if(isLoading){
      dataToRender = <Spinner className="spinner" animation="border" variant="success" />;
    } else if(queryError && !result){
      dataToRender = alertInfo("danger", 'Error: ' + queryError.message);
    } else if(!isLoading && result){
      let issueDetail = type==='org' ? {...result.organization.repository.issue} : {...result.user.repository.issue};
      let issueStatus = issueDetail.closed ? 'Closed' : 'Open';      
      let issueComments = issueDetail.comments.nodes;
   
      dataToRender = <div key="issueDetail">
        <Container>
          <Row className="margin-top-40">
            <Col md="12">
            <h1 className="float-left">
              <span className="issue-title">{issueDetail.title}</span>
              <span className="issue-number"> #{issueDetail.number}</span>
            </h1>
            </Col>
          </Row>
          <Row>
            <Col md="8">
              <div className="openedThisIssue">
                <Badge variant={`${issueDetail.closed ? 'danger' : "success"}`}>
                  {issueStatus}
                </Badge>
                <span className="openedThisIssue-text">
                  <b>{issueDetail.author.login}</b> opened this issue {moment(issueDetail.createdAt, 'YYYY-MM-DD h:mm:ss').fromNow()} . {issueDetail.comments.nodes.length} comments
                </span>
              </div>
            </Col>
            <Col md="10">
            <hr />
            </Col>
          </Row>
          <Row>
            <Col md="4">
            <InputGroup className="mb-3 comments-filter">
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1">Filter</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
                placeholder="Type anything to filter comments"
                onChange={(e) => {
                  setFilterValue(e.target.value.trim());
                }}
              />
            </InputGroup>
            </Col>
          </Row>
          <Row key={issueDetail.id} 
            className={`${filterValue==='' || 
            (filterValue!=='' && issueDetail.bodyText.includes(filterValue)) ? 'show' : "hide"}`}
          >
            <Col md="10">
              <Card className="issue-description">
                <Card.Header>
                  <b>{issueDetail.author.login}</b> commented {moment(issueDetail.createdAt, 'YYYY-MM-DD h:mm:ss').fromNow()}
                </Card.Header>
                <Card.Body>
                  <Card.Text>
                    <span dangerouslySetInnerHTML={{ __html: issueDetail.bodyHTML}}></span>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {issueComments.filter((comment) => {
            if(filterValue===''){
              return comment;
            } else if(comment.bodyText.includes(filterValue)){
              return comment;
            } else{
              return null;
            }
          })
          .map(comment => (
            <Row key={comment.id} className='margin-top-20'>
              <Col md="10">
                <Card className="issue-description">
                  <Card.Header>
                    <b>{comment.author.login}</b> commented {moment(comment.createdAt, 'YYYY-MM-DD h:mm:ss').fromNow()}
                  </Card.Header>
                  <Card.Body>
                    <Card.Text>
                      <span dangerouslySetInnerHTML={{ __html: comment.bodyHTML}}></span>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ))}
        </Container>
        </div>
    }
  } else {
    dataToRender = alertInfo("danger", 'The url parameters are not correct to fetch the data');
  }
  return dataToRender;
}

export default IssueDetail;
