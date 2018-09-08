import * as React from 'react'
import { ChangeEvent, Component } from 'react'
import { connect, MapDispatchToProps } from 'react-redux'
import { signIn } from './authActions'
import { merge } from 'lodash/fp'
import { HomeGameThunkDispatch } from '../state'
  import { Link } from 'react-router-dom'
  import { Status } from '../status/Status'
  import {
    Form, FormGroup, Button, Input, Label, 
    Jumbotron,
    Container, Row, Col
  } from 'reactstrap'

type SignInProps = {
  signIn(email: string, password: string): void
}

type SignInState = {
  email: string
  password: string
}

namespace UI {
  export class SignIn extends Component<SignInProps, SignInState> {
    state: SignInState = {
      email: '',
      password: ''
    }

    updateField = (key: keyof SignInState) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      this.setState(state => merge(state, {
        [key]: value
      }))
    }

    signIn = () => {
      this.props.signIn(this.state.email, this.state.password)
    }

    render() {
      return (
        <Container style={{ paddingTop: '16px' }}>
          <Row>
            <Col>
              <Jumbotron>
                <Form color='primary'>
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Input type="email" name="email" id="email" placeholder="email" onChange={this.updateField('email')} />
                  </FormGroup>
                  <FormGroup>
                    <Label for="password">Password</Label>
                    <Input type="password" name="password" id="password" placeholder="password" onChange={this.updateField('password')} />
                  </FormGroup>
                  <Button color="primary" onClick={this.signIn}>Sign In</Button>{' '}
                  <Link to="/sign-up"><Button outline={true} color="secondary">Sign Up</Button></Link>
                </Form>              
              </Jumbotron>
            </Col>
          </Row>
          <Row>
            <Col>
                Forgot your password? <Link to={`/reset-password?email=${this.state.email}`}>Reset Password</Link>
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

const mapDispatchToProps: MapDispatchToProps<SignInProps, {}> = (dispatch: HomeGameThunkDispatch) => ({
  signIn(email: string, password: string) {
    dispatch(signIn(email, password))
  }
})

export const SignIn = connect(undefined, mapDispatchToProps)(UI.SignIn)