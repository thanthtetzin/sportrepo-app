import React, { useState } from "react";
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
  if(props.isLoading){
    searchResult = <Spinner className="spinner" animation="border" variant="success" />
  } else if(props.queryError && !props.result){
    searchResult = alertInfo("danger", (searchTypeName==='Username' ? 'Cannot find this Username in GitHub!' : 'Cannot find this Organization in GitHub!'));
  }
  else if(!props.isLoading && props.result){
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
  const [ orgOrUserName, setOrgOrUserName ] = useState('');
  const [ repoName, setRepoName ] = useState('');
  const [ yourToken, setYourToken ] = useState('');
  const [ searchTypeName, setSearchTypeName ] = useState('Username');
  let [ isLoading, setIsLoading ] = useState(false);
  let [ queryError, setQueryError ] = useState('');
  let [ result, setResult ] = useState(null);
  let [ notShowAnything, setNotShowAnything ] = useState(false);

  const resetData = () => {
    console.log('resetData');
    setValidated(false);
    setOrgOrUserName('');
    setRepoName('');
    setIsLoading(false);
    setQueryError('');
    setResult(null);
  }
  const fetchRepoDetails_CallBack = (typeName, error, loading, data) => {
    if(typeName===searchTypeName){
      if (data) {
        console.log('data: ', data);
        result = data;
        isLoading=false;
      }
      if(error){
        console.log('error: ', error);
        queryError = error;
        isLoading=false;
      }
      if(loading){
        isLoading=true;
      }
    }
  }
  const [fetchOrgRepoDetails, { error: orgRepoError, loading: orgRepoLoading, data: orgRepoData }] = useLazyQuery(FETCH_ORG_REPO_DETAILS);
  const [fetchUserRepoDetails, { error: userRepoError, loading: userRepoLoading, data: userRepoData }] = useLazyQuery(FETCH_USERNAME_REPO_DETAILS);
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
    setNotShowAnything(false);
    let usedToken = (yourToken) ? yourToken : process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN;
    localStorage.setItem('token', usedToken);
    console.log(localStorage.getItem('token'));
    isLoading = true;
    console.log('searchTypeName: ', searchTypeName)
    fetchFilteredOrgRepoDetails();
  }
  const fetchFilteredOrgRepoDetails = () => {
    const fetchPR = true, fetchOpenedIssue = true, fetchClosedIssue = true;
    const fetchPROrderBy = 'CREATED_AT', fetchOpenedIssueOrderBy = 'CREATED_AT', fetchClosedIssueOrderBy  = 'CREATED_AT';
    const fetchPRSortDirection = 'DESC', fetchOpenedIssueSortDirection = 'DESC', fetchClosedIssueSortDirection  = 'DESC';
    if(searchTypeName==='Username'){
      let username = orgOrUserName;
      fetchUserRepoDetails({ variables: { username, repoName, 
        fetchPR, fetchPROrderBy, fetchPRSortDirection,
        fetchOpenedIssue, fetchOpenedIssueOrderBy, fetchOpenedIssueSortDirection,
        fetchClosedIssue, fetchClosedIssueOrderBy, fetchClosedIssueSortDirection
      } });
    } else{
      let orgName = orgOrUserName;
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
                setNotShowAnything(true);
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
                setNotShowAnything(true);
              }}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Row>
              <Form.Group as={Col} md="8" >
                <InputGroup className="mb-3">
                  <Form.Control
                    required
                    name="orgOrUserName"
                    id="orgOrUserName"
                    type="text"
                    placeholder={(searchTypeName ==='Username' ? 'Username' : 'Organization Name')}
                    value={orgOrUserName}
                    onChange={e=> setOrgOrUserName(e.target.value.trim())}
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
                    value={repoName}
                    onChange={e=> setRepoName(e.target.value.trim())}
                  />
                  <InputGroup.Append>
                    <Button type="submit" variant="outline-primary">Search</Button>
                  </InputGroup.Append>
                </InputGroup>
              </Form.Group>
            </Form.Row>
          </Form>
        </Col>
        <Col as={Col} md="4">
          <InputGroup >
            <InputGroup.Prepend>
              <InputGroup.Text id="basic-addon1" className="bg-pale-blue"> <FontAwesomeIcon icon={faKey} /> </InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              placeholder="Your Token"
              onChange={(e) => {
                setYourToken(e.target.value.trim());
              }}
            />
          </InputGroup>
        </Col>
      </Row>
    </Container>
    <DisplayResultsInTabView orgOrUserName={orgOrUserName} repoName={repoName} notShowAnything={notShowAnything} searchTypeName={searchTypeName} queryError={queryError} isLoading={isLoading} result={result} />
  </div>;
  
  
  
  
  return ([
    searchControls
    ]
  );
}

export default SearchRepo;
