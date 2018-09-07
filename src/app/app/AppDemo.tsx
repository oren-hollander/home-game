import * as React from 'react'
import { SFC } from 'react'
import { 
  Form, FormGroup, Button, Input, Label, Container, 
  ListGroup, ListGroupItem, 
  Row, Col, Alert, Breadcrumb, BreadcrumbItem, Jumbotron
} from 'reactstrap'
import { Link } from 'react-router-dom'

export const App: SFC = () =>
  <>
    <Breadcrumb>
      <BreadcrumbItem><a href="#">Home</a></BreadcrumbItem>
      <BreadcrumbItem><a href="#">Addresses</a></BreadcrumbItem>
      <BreadcrumbItem active={true}>Shtible</BreadcrumbItem>
    </Breadcrumb>
    <Container>
      <Row>
        <Col>
          <Alert color="info">
            Top
        </Alert>
          <Alert color="danger">
            <a href="#">lalal</a>
          </Alert>
        </Col>
      </Row>
      <Row>
        <Col>
            <Jumbotron>
              <Form color='primary'>
                <FormGroup>
                  <Label for="exampleEmail">Email</Label>
                  <Input type="email" name="email" id="exampleEmail" placeholder="with a placeholder" />
                </FormGroup>
                <FormGroup>
                  <Label for="examplePassword">Password</Label>
                  <Input type="password" name="password" id="examplePassword" placeholder="password placeholder" />
                </FormGroup>
                <Button>Submit</Button>
              </Form>
            </Jumbotron>
        </Col>
      </Row>
      <Row>
        <Col>
          <ListGroup>
            <ListGroupItem active={true} tag="a" href="#" action={true}>Cras justo odio</ListGroupItem>
            <ListGroupItem action={true}><Link to="/testgfd">Dapibus ac facilisis in</Link></ListGroupItem>
            <ListGroupItem tag="button" action={true}>Morbi leo risus</ListGroupItem>
            <ListGroupItem tag="a" action={true}>Porta ac consectetur ac</ListGroupItem>
            <ListGroupItem disabled={true} tag="a" href="#" action={true}>Vestibulum at eros</ListGroupItem>
          </ListGroup>
        </Col>
      </Row>
    </Container>
  </> 