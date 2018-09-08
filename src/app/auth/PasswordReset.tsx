import * as React from 'react'
import { Component, ChangeEvent } from 'react'
import { isEmpty } from 'lodash/fp'
import { connect, MapDispatchToProps } from 'react-redux'
import { sendPasswordResetEmail } from './authActions'
import { HomeGameThunkDispatch } from '../state'
import { showStatus, ErrorStatus } from '../status/statusActions'
import { RouteComponentProps } from 'react-router-dom'
import { parse } from 'query-string'
import { Form, FormGroup, Button, Input, Label, Jumbotron } from 'reactstrap'
import { Page } from '../../ui/Page'

interface PasswordResetDispatchProps {
  sendPasswordResetEmail(email: string): void
  showError(error: string): void
}

interface PasswordResetState {
  oobCode: string
  email: string
}

type PasswordResetProps =  PasswordResetDispatchProps

namespace UI {
  export class PasswordReset extends Component<RouteComponentProps<{}> & PasswordResetProps, PasswordResetState> {

    query = parse(this.props.location.search) as { email: string }

    state: PasswordResetState = {
      email: this.query.email,
      oobCode: ''
    }

    codeChanged = (e: ChangeEvent<HTMLInputElement>): void => {
      this.setState({ oobCode: e.target.value })
    }

    emailChanged = (e: ChangeEvent<HTMLInputElement>): void => {
      this.setState({ email: e.target.value })
    }

    sendPasswordResetEmail = (): void => {
      if (isEmpty(this.state.email)) {
        this.props.showError('Enter your email')
      }
      else {
        this.props.sendPasswordResetEmail(this.state.email)
      }
    }

    render() {
      return (
        <Page toolbar={false}>
          <Jumbotron>
            <Form color='primary'>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input type="email" name="email" id="email" placeholder="email" defaultValue={this.state.email} onChange={this.emailChanged} />
              </FormGroup>
            </Form>
            <Button color="primary" onClick={this.sendPasswordResetEmail}>Send</Button>
          </Jumbotron>
        </Page>

    /* <div>
          <p>
            To verify your email, click on the 'Send' button.
          </p>
          <p>
            An email with a link will be sent to you.
          </p>
          <p>
            Click on that link to verify your email address
          </p>
        </div>
        <input type="email" defaultValue={this.state.email} onChange={this.emailChanged} />
        <button onClick={this.sendPasswordResetEmail}>Send</button> */
      )
    }
  }
}

const mapDispatchToProps: MapDispatchToProps<PasswordResetDispatchProps, {}> = (dispatch: HomeGameThunkDispatch): PasswordResetDispatchProps => ({
  sendPasswordResetEmail(email: string) {
    dispatch(sendPasswordResetEmail(email))
  },
  showError(error: string) {
    dispatch(showStatus(ErrorStatus(error)))
  }
})


export const PasswordReset = connect(undefined, mapDispatchToProps)(UI.PasswordReset)
