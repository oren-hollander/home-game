import * as React from 'react'
import { ChangeEvent, Component } from 'react'
import { connect, MapDispatchToProps } from 'react-redux'
import { registerUser } from '../auth/authActions'
import { ThunkDispatch } from 'redux-thunk'
import { State, HomeGameAction} from '../state'
import { Services } from '../../services/services'
import { Link } from 'react-router-dom'
import { Status } from '../status/Status'
import {
  Form, FormGroup, Button, Input, Label,
  Jumbotron,
  Container, Row, Col
} from 'reactstrap'


type SignUpProps = {
  signUp: (email: string, name: string, password: string) => void
}

type SignUpState = {
  email: string
  name: string
  password: string
}

namespace UI {
  export class SignUp extends Component<SignUpProps, SignUpState> {
    state: SignUpState = {
      name: '',
      email: '',
      password: ''
    }

    updateField = (key: keyof SignUpState) => (e: ChangeEvent<HTMLInputElement>) => {
      this.setState({ [key]: e.target.value } as {})
    }

    signUp = () => {
      this.props.signUp(this.state.email, this.state.name, this.state.password)
    }

    render() {
      return (
        <Container style={{ paddingTop: '16px' }}>
          <Row>
            <Col>
              <Jumbotron>
                <Form color='primary'>
                  <FormGroup>
                    <Label for="name">Email</Label>
                    <Input type="text" name="text" id="name" placeholder="name" onChange={this.updateField('name')} />
                  </FormGroup>
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Input type="email" name="email" id="email" placeholder="email" onChange={this.updateField('email')} />
                  </FormGroup>
                  <FormGroup>
                    <Label for="password">Password</Label>
                    <Input type="password" name="password" id="password" placeholder="password" onChange={this.updateField('password')} />
                  </FormGroup>
                </Form>
                <Button color="primary" onClick={this.signUp}>Sign Up</Button>{' '}

                <Link to="/"><Button outline={true} color="secondary">Sign In</Button></Link>
              </Jumbotron>
            </Col>
          </Row>
          <Row>
            <Col>
              <Status />
            </Col>
          </Row>
        </Container>
      )
    }
  }
}

const mapDispatchToProps: MapDispatchToProps<SignUpProps, {}> = (dispatch: ThunkDispatch<State, Services, HomeGameAction>) => ({
  signUp(email: string, name: string, password: string) {
    dispatch(registerUser(email, name, password))
  }
})

export const SignUp = connect(undefined, mapDispatchToProps)(UI.SignUp)