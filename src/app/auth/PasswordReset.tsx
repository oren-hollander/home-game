import * as React from 'react'
import { Component, ChangeEvent } from 'react'
import { isEmpty } from 'lodash/fp'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { connect, MapDispatchToProps } from 'react-redux'
import { sendPasswordResetEmail } from './authActions'
import { HomeGameThunkDispatch } from '../state'
import { showError } from '../status/statusActions'

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
  export class PasswordReset extends Component<PasswordResetProps, PasswordResetState> {
    state: PasswordResetState = {
      email: '',
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
      return <>
        <Typography color="primary" variant="caption">
          <p>
            To verify your email, click on the 'Send' button.
          </p>
          <p>
            An email with a link will be sent to you.
          </p>
          <p>
            Click on that link to verify your email address
          </p>
        </Typography>
        <input type="email" onChange={this.emailChanged} />
        <Button color="primary" variant="contained" onClick={this.sendPasswordResetEmail}>Send</Button>
      </>
    }
  }
}

const mapDispatchToProps: MapDispatchToProps<PasswordResetDispatchProps, {}> = (dispatch: HomeGameThunkDispatch): PasswordResetDispatchProps => ({
  sendPasswordResetEmail(email: string) {
    dispatch(sendPasswordResetEmail(email))
  },
  showError(error: string) {
    dispatch(showError(error))
  }
})


export const PasswordReset = connect(undefined, mapDispatchToProps)(UI.PasswordReset)