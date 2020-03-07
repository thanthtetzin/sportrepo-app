import React, { useState } from "react";
import {
  InputGroup,
  Container,
  Row,
  Button,
  Col,
  Form,
  Tabs,
  Tab
} from "react-bootstrap";
import "./SearchRepo.css";

const SearchRepo = () => {
  const [ validated, setValidated ] = useState(false);
  const [ userName, setUserName ] = useState('nuwave');
  const [ repoName, setRepoName ] = useState('lighthouse');
  const [key, setKey] = useState('pr');
  const handleSubmit = event => {
    const form = event.currentTarget;
    event.preventDefault();
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else{
      setValidated(true);
      submit();
    }    
  };
  const submit = () => {
    console.log(userName, repoName);
  }
  const searchControls = <div key="searchControls">
    <h2>Search your repo in here</h2>
    <Container>
      <Row>
        <Col>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Row>
              <Form.Group as={Col} md="5" controlId="validationCustom01">
                <label htmlFor="userName" className="float-left">Search the git repository</label>
                <InputGroup className="mb-3">
                  <Form.Control
                    required
                    name="userName"
                    type="text"
                    placeholder="Username"
                    value={userName}
                    onChange={e=> setUserName(e.target.value)}
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
                    onChange={e=> setRepoName(e.target.value)}
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
  </div>;
  const tabControls = <Container key="tabControls">
      <Row>
        <Col>
        <Tabs activeKey={key} onSelect={k => setKey(k)}>
          <Tab eventKey="pr" title="Pull Requests">
            
          </Tab>
          <Tab eventKey="opened-issues" title="Opened Issues">
          </Tab>
          <Tab eventKey="closed-issues" title="Closed Issues">
          </Tab>
        </Tabs>
        </Col>
      </Row>
    </Container>;
  
  return ([
    searchControls,
    tabControls
    ]
  );
}

export default SearchRepo;
