import * as React from 'react'
import {ChangeEvent, Component} from 'react'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import {connect} from 'react-redux'
import {Dispatch} from 'redux'
import {signIn} from './authActions'

type SignInProps = {
  signIn: (email: string, password: string) => void
}

type SignInState = {
  email: string
  password: string
}

export class SignInComponent extends Component<SignInProps, SignInState> {
  state = {
    email: '',
    password: ''
  }

  updateEmail = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({email: e.target.value})
  }

  updatePassword = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({password: e.target.value})
  }

  signIn = () => {
    this.props.signIn(this.state.email, this.state.password)
  }

  render() {
    return (
      <div>
        <input type="text" placeholder="email" onChange={this.updateEmail}/>
        <input type="password" placeholder="password" onChange={this.updatePassword}/>
        <Button color="primary" onClick={this.signIn}>
          <Typography variant="button" color="inherit">Sign In</Typography>
        </Button>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  signIn: (email: string, password: string): void => {
    dispatch(signIn(email, password))
  }
})

export const SignIn = connect(undefined, mapDispatchToProps)(SignInComponent)