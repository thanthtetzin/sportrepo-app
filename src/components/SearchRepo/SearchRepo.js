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
import "./SearchRepo.css";
import FETCH_ORG_REPO_DETAILS from '../../graphQL-helpers/fetchOrgRepoDetailsQuery';
import { useLazyQuery } from '@apollo/react-hooks';

function ListByType(props){
  let dataType = props.dataType;
  let data = props.data;
  let returnElements = null;
  if(data){
    returnElements = data.map((dataItem,index) => {
      return <Card key={index} className="list-item-row">
      <Card.Body>
        <Card.Title className="font-size-16"><a href={`${dataType!=='pr' ? `/issues/${dataItem.number}` : ""}`}>{dataItem.title}</a></Card.Title>
        <Card.Subtitle className="mb-2 text-muted font-size-12">#{dataItem.number} opened at {dataItem.createdAt} by {dataItem.author.login}</Card.Subtitle>
      </Card.Body>
    </Card>
    })
  }
  return returnElements;
}

function DisplayResultsInTabView(props) {
  const [key, setKey] = useState('pr');
  let searchResult = null;
  const alertInfo = (variant, message) => {
    return <Container>
        <Row>
          <Col>
            <Alert  variant={variant}>
              <p dangerouslySetInnerHTML={{ __html: message}}></p>
            </Alert>
          </Col>
        </Row>
      </Container>;
  }
  if(props.isLoading){
    searchResult = <Spinner animation="border" variant="success" />
  } else if(props.error){
    searchResult = alertInfo("danger", `Cannot find this Organization in GitHub!`);
  } else if(!props.isLoading && props.result){
    let result = props.result;
    if(result.organization && !result.organization.repository){
      searchResult = alertInfo("info", `There is no specified repository in this Organization!`);
    } else{
      let pullRequests = result.organization.repository.pullRequests ? result.organization.repository.pullRequests.nodes : null;
      let openedIssues = result.organization.repository.openedIssues ? result.organization.repository.openedIssues.nodes : null;
      let closedIssues = result.organization.repository.closedIssues ? result.organization.repository.closedIssues.nodes : null;
      searchResult = <Container key="tabControls">
        <Row>
          <Col>
          <Tabs activeKey={key} onSelect={k => setKey(k)}>
            <Tab eventKey="pr" title="Pull Requests">
              <ListByType dataType="pr" data={pullRequests} />
            </Tab>
            <Tab eventKey="opened-issues" title="Opened Issues">
              <ListByType dataType="opened-issue" data={openedIssues} />
            </Tab>
            <Tab eventKey="closed-issues" title="Closed Issues">
              <ListByType dataType="closed-issue" data={closedIssues} />
            </Tab>
          </Tabs>
          </Col>
        </Row>
      </Container>;
    }
  }
  return searchResult;      
}

function SearchRepo() {
  const [ validated, setValidated ] = useState(false);
  const [ orgName, setOrgName ] = useState('');
  const [ repoName, setRepoName ] = useState('');
  let [ isLoading ] = useState(false);
  let [ result ] = useState(null);

  const [fetchOrgRepoDetails, { error, loading, data }] = useLazyQuery(FETCH_ORG_REPO_DETAILS);
  const fetchOrgRepoDetails_CallBack = (error, loading, data) => {
    if (data) {
      console.log('Returned data: ' , data);
      result = data;
      isLoading=false;
    }
    if(error){
      console.log('Error: ' , error);
      isLoading=false;
    }
    if(loading){
      isLoading=true;
    }
  }
  fetchOrgRepoDetails_CallBack(error, loading, data);


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
    localStorage.setItem('token', process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN);
    isLoading = true;
    fetchFilteredOrgRepoDetails();
  }
  const fetchFilteredOrgRepoDetails = () => {
    const fetchPR = true, fetchOpenedIssue = true, fetchClosedIssue = true;
    const fetchPROrderBy = 'CREATED_AT', fetchOpenedIssueOrderBy = 'CREATED_AT', fetchClosedIssueOrderBy  = 'CREATED_AT';
    const fetchPRSortDirection = 'DESC', fetchOpenedIssueSortDirection = 'DESC', fetchClosedIssueSortDirection  = 'DESC';
    fetchOrgRepoDetails({ variables: { orgName, repoName, 
      fetchPR, fetchPROrderBy, fetchPRSortDirection,
      fetchOpenedIssue, fetchOpenedIssueOrderBy, fetchOpenedIssueSortDirection,
      fetchClosedIssue, fetchClosedIssueOrderBy, fetchClosedIssueSortDirection
     } });
  }

  const searchControls = <div key="searchControls">
    <h2>Search your repo in here</h2>
    <Container>
      <Row>
        <Col>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Row>
              <Form.Group as={Col} md="5" controlId="validationCustom01">
                <label htmlFor="orgName" className="float-left">Search the git repository</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    required
                    name="orgName"
                    type="text"
                    placeholder="Organization Name"
                    value={orgName}
                    onChange={e=> setOrgName(e.target.value.trim())}
                  />
                  <InputGroup.Prepend>
                    <InputGroup.Text>/</InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    required
                    name="repoName"
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
      </Row>
    </Container>
    <DisplayResultsInTabView error={error} isLoading={isLoading} result={result} orgName={orgName} repoName={repoName} />
  </div>;
  
  
  
  
  return ([
    searchControls
    ]
  );
}

export default SearchRepo;
