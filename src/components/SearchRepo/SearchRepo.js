import React, { useState, useRef } from "react";
import {
  InputGroup,
  Container,
  Row,
  Button,
  Col,
  Form,
  Tabs,
  Tab,
  Spinner,
  Alert,
  Card
} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import "./SearchRepo.css";
import { FETCH_USERNAME_REPO_DETAILS, FETCH_ORG_REPO_DETAILS } from '../../graphQL-helpers/fetchOrgRepoDetailsQuery';
import { useLazyQuery } from '@apollo/react-hooks';
import moment from 'moment';

function ListByType(props){
  let dataType = props.dataType;
  let data = props.data;
  let returnElements = null;
  if(data.length){
    let type = (props.searchTypeName==='Username') ? 'user' : 'org';
    returnElements = data.map((dataItem,index) => {
      return <Card key={index} className="list-item-row">
      <Card.Body>
        <Card.Title className="font-size-16"><a href={`${dataType!=='pr' ? `/${type}/${props.orgOrUserName}/${props.repoName}/issues/${dataItem.number}` : "#"}`}>{dataItem.title}</a></Card.Title>
        <Card.Subtitle className="mb-2 text-muted font-size-12">#{dataItem.number} opened at {moment(dataItem.createdAt, 'YYYY-MM-DD h:mm:ss').fromNow()} by {dataItem.author.login}</Card.Subtitle>
      </Card.Body>
    </Card>
    })
  } else{
    returnElements = <p className="nothing-to-show">Nothing to show</p>
  }
  return returnElements;
}

function DisplayResultsInTabView(props) {
  let searchTypeName = props.searchTypeName || null;
  const [key, setKey] = useState('pr');
  let searchResult = null;
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
  let authorizedResponse = true;
  if(props.isLoading){
    searchResult = <Spinner className="spinner" animation="border" variant="success" />
  } else if(props.queryError && !props.queryError.includes('Received status code 401') && !props.result){
    searchResult = alertInfo("danger", (searchTypeName==='Username' ? 'Cannot find this Username in GitHub!' : 'Cannot find this Organization in GitHub!'));
  } else if(props.queryError && props.queryError.includes('Received status code 401')){
    searchResult = alertInfo("danger", 'Error 401: Authorization failed with current token to get response');
    authorizedResponse = false;
  }
  else if(!props.isLoading && props.result && authorizedResponse){
    let result = props.result;
    let pullRequests = null;
    let openedIssues = null;
    let closedIssues = null;
    let isRepositoryExisted = false;
    if(searchTypeName==='Username'){
      if(result.username && !result.username.repository){
        searchResult = alertInfo("info", `There is no specified repository for this Username!`);
      } else {
        isRepositoryExisted = true;
        pullRequests = (result.username && result.username.repository.pullRequests) ? result.username.repository.pullRequests.nodes : null;
        openedIssues = (result.username && result.username.repository.openedIssues) ? result.username.repository.openedIssues.nodes : null;
        closedIssues = (result.username && result.username.repository.closedIssues) ? result.username.repository.closedIssues.nodes : null;
      }
    } else{
      if(result.organization && !result.organization.repository){
        searchResult = alertInfo("info", `There is no specified repository in this Organization!`);
      } else {
        isRepositoryExisted = true;
        pullRequests = (result.organization && result.organization.repository.pullRequests) ? result.organization.repository.pullRequests.nodes : null;
        openedIssues = (result.organization && result.organization.repository.openedIssues) ? result.organization.repository.openedIssues.nodes : null;
        closedIssues = (result.organization && result.organization.repository.closedIssues) ? result.organization.repository.closedIssues.nodes : null;
      }
    }
    searchResult = (isRepositoryExisted) ? <Container key="tabControls">
      <Row>
        <Col>
        <Tabs activeKey={key} onSelect={k => setKey(k)}>
          <Tab eventKey="pr" title="Pull Requests">
            <ListByType dataType="pr" data={pullRequests} orgOrUserName={props.orgOrUserName} repoName={props.repoName} />
          </Tab>
          <Tab eventKey="opened-issues" title="Opened Issues">
            <ListByType dataType="opened-issue" data={openedIssues} orgOrUserName={props.orgOrUserName} repoName={props.repoName} searchTypeName={searchTypeName} />
          </Tab>
          <Tab eventKey="closed-issues" title="Closed Issues">
            <ListByType dataType="closed-issue" data={closedIssues} orgOrUserName={props.orgOrUserName} repoName={props.repoName} searchTypeName={searchTypeName} />
          </Tab>
        </Tabs>
        </Col>
      </Row>
    </Container> : searchResult;
  }
  if(props.notShowAnything){
    return null;
  } else {
    return searchResult; 
  }   
}

function SearchRepo() {
  const [ validated, setValidated ] = useState(false);
  const [ searchTypeName, setSearchTypeName ] = useState('Username');
  const yourTokenRef = useRef(null);
  const repoNameRef = useRef('');
  const orgOrUserNameRef = useRef('');
  let isLoading = false;
  let queryError = '';
  let result = null;
  let notShowAnything  = false;
  
  const resetData = () => {
    console.log('resetData');
    setValidated(false);
    orgOrUserNameRef.current.value='';
    repoNameRef.current.value='';
    isLoading = false;
    queryError = '';
    result = null;
    notShowAnything = true;
  }
  const fetchRepoDetails_CallBack = (typeName, error, loading, data) => {
    if(typeName===searchTypeName && 
      orgOrUserNameRef.current.value && repoNameRef.current.value && yourTokenRef.current.value){
      if (data) {
        console.log('data: ', data);
        result = data;
        isLoading=false;
      }
      if(error){
        console.log('error: ', error.toString());
        queryError = error.toString();
        isLoading=false;
      }
      if(loading){
        isLoading=true;
      }
    }
  }
  const [fetchOrgRepoDetails, { error: orgRepoError, loading: orgRepoLoading, data: orgRepoData }] = useLazyQuery(FETCH_ORG_REPO_DETAILS, {fetchPolicy: "cache-and-network"});
  const [fetchUserRepoDetails, { error: userRepoError, loading: userRepoLoading, data: userRepoData }] = useLazyQuery(FETCH_USERNAME_REPO_DETAILS, {fetchPolicy: "cache-and-network"});
  fetchRepoDetails_CallBack('Organization', orgRepoError, orgRepoLoading, orgRepoData);
  fetchRepoDetails_CallBack('Username', userRepoError, userRepoLoading, userRepoData);

  const handleSubmit = event => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else{
      submit();
    }
    setValidated(true);
  };
  const submit = () => {
    console.log('searchTypeName: ', searchTypeName);
    notShowAnything = false;
    isLoading = true;
    let usedToken = yourTokenRef.current.value.trim();
    yourTokenRef.current.value = usedToken;
    localStorage.setItem('token', usedToken);
    
    fetchFilteredOrgRepoDetails();
  }
  const fetchFilteredOrgRepoDetails = () => {
    const fetchPR = true, fetchOpenedIssue = true, fetchClosedIssue = true;
    const fetchPROrderBy = 'CREATED_AT', fetchOpenedIssueOrderBy = 'CREATED_AT', fetchClosedIssueOrderBy  = 'CREATED_AT';
    const fetchPRSortDirection = 'DESC', fetchOpenedIssueSortDirection = 'DESC', fetchClosedIssueSortDirection  = 'DESC';
    const repoName = repoNameRef.current.value.trim();
    repoNameRef.current.value = repoName;
    if(searchTypeName==='Username'){
      const username = orgOrUserNameRef.current.value.trim();
      orgOrUserNameRef.current.value = username;
      fetchUserRepoDetails({ variables: { username, repoName, 
        fetchPR, fetchPROrderBy, fetchPRSortDirection,
        fetchOpenedIssue, fetchOpenedIssueOrderBy, fetchOpenedIssueSortDirection,
        fetchClosedIssue, fetchClosedIssueOrderBy, fetchClosedIssueSortDirection
      } });
    } else{
      const orgName = orgOrUserNameRef.current.value.trim();
      orgOrUserNameRef.current.value = orgName;
      fetchOrgRepoDetails({ variables: { orgName, repoName, 
        fetchPR, fetchPROrderBy, fetchPRSortDirection,
        fetchOpenedIssue, fetchOpenedIssueOrderBy, fetchOpenedIssueSortDirection,
        fetchClosedIssue, fetchClosedIssueOrderBy, fetchClosedIssueSortDirection
      } });
    }
  }

  const searchControls = <div key="searchControlsAndTabsView">
    <h2>Search your repo in here</h2>
    <Container>
      <Row className="search-git-control">
        <Col md="5">
          <label htmlFor="orgOrUserName" className="float-left">Search the git repository of:</label>
          <Form.Group as={Row} className="type-radios">
            <Form.Check inline
              checked={searchTypeName==='Username'}
              label="Username" 
              type="radio" 
              id="rdoUsername" 
              name="typeRadios"
              onChange={ () => {
                setSearchTypeName('Username');
                resetData();
              }}
            />
            <Form.Check inline 
              checked={searchTypeName==='Organization'}
              label="Organization" 
              type="radio" 
              id="rdoOrganization" 
              name="typeRadios"
              onChange={ () => {
                setSearchTypeName('Organization');
                resetData();
              }}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Row>
              <Form.Group as={Col} md="10" >
                <InputGroup className="mb-3">
                  <Form.Control
                    required
                    name="orgOrUserName"
                    id="orgOrUserName"
                    type="text"
                    placeholder={(searchTypeName ==='Username' ? 'Username' : 'Organization Name')}
                    ref={orgOrUserNameRef}
                  />
                  <InputGroup.Prepend>
                    <InputGroup.Text>/</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    required
                    name="repoName"
                    id="repoName"
                    type="text"
                    placeholder="Repo name"
                    ref={repoNameRef}
                  />
                    <InputGroup.Prepend>
                      <InputGroup.Text id="basic-addon1" className="bg-pale-blue"> <FontAwesomeIcon icon={faKey} /> </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      required
                      placeholder="Your Personal Access Token"
                      ref={yourTokenRef}
                    />
         
                  <InputGroup.Append>
                    <Button type="submit" variant="outline-primary">Search</Button>
                  </InputGroup.Append>
                </InputGroup>
              </Form.Group>
        
            </Form.Row>
          </Form>
        </Col>
        
      </Row>
    </Container>
    <DisplayResultsInTabView orgOrUserName={orgOrUserNameRef.current.value} 
      repoName={repoNameRef.current.value} notShowAnything={notShowAnything} searchTypeName={searchTypeName} 
      queryError={queryError} isLoading={isLoading} result={result} />
  </div>;
  
  return searchControls;
}

export default SearchRepo;
