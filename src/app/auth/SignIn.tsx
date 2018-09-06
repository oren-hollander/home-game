import * as React from 'react'
import { ChangeEvent, Component } from 'react'
import { connect, MapDispatchToProps } from 'react-redux'
import { signIn } from './authActions'
import { merge } from 'lodash/fp'
import { HomeGameThunkDispatch } from '../state'
import { Link } from 'react-router-dom';

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
        <>
          <div>
            <label>
              Email
              <input id="email" type="email" placeholder="email" onChange={this.updateField('email')} />
            </label>
          </div>
          <div>
            <label>
              Password
              <input type="password" placeholder="password" onChange={this.updateField('password')} />
            </label>
          </div>
          <button onClick={this.signIn}>
            Sign In
          </button>
          <p>
            Forgot your password?
            <Link to="/reset-password">Reset Password</Link>
          </p>
        </>
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