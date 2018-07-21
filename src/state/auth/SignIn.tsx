import * as React from 'react'
import {ChangeEvent, Component} from 'react'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import {connect, MapDispatchToProps} from 'react-redux'
import {Dispatch} from 'redux'
import {signIn} from './authActions'
import {registerUser} from '../users/usersActions'
import {merge} from 'lodash/fp'

type SignInProps = {
  signIn: (email: string, password: string) => void
  signUp: (email: string, name: string, password: string) => void
}

type Fields = {
  email: string
  name: string
  password: string
}

type SignInState = {
  sign: 'in' | 'up'
  fields: Fields
}

export class SignInComponent extends Component<SignInProps, SignInState> {
  state: SignInState = {
    sign: 'in',
    fields: {
      email: '',
      name: '',
      password: ''
    }
  }

  updateField = (key: keyof Fields) => (e: ChangeEvent<HTMLInputElement>) => {
    e.persist()
    this.setState(state => merge(state, {
      fields: {
        [key]: e.target.value
      }
    } ))
  }

  signInSignUp = () => {
    if(this.state.sign === 'in') {
      this.props.signIn(this.state.fields.email, this.state.fields.password)
    }
    else {
      this.props.signUp(this.state.fields.email, this.state.fields.name, this.state.fields.password)
    }
  }

  setSignIn = () => {
    this.setState({sign: 'in'})
  }

  setSignUp = () => {
    this.setState({sign: 'up'})
  }

  render() {
    return (
      <div>
        <button onClick={this.setSignIn}>Sign In</button>
        <button onClick={this.setSignUp}>Sign Up</button>
        <input type="text" placeholder="email" onChange={this.updateField('email')}/>
        {
          this.state.sign === 'up' && <input type="text" placeholder="name" onChange={this.updateField('name')}/>
        }
        <input type="password" placeholder="password" onChange={this.updateField('password')}/>
        <Button color="primary" onClick={this.signInSignUp}>
          <Typography variant="button" color="inherit">{this.state.sign === 'in' ? 'Sign In' : 'Sign Up'}</Typography>
        </Button>
      </div>
    )
  }
}

const mapDispatchToProps: MapDispatchToProps<SignInProps, {}> = (dispatch: Dispatch) => ({
  signIn: (email: string, password: string): void => {
    dispatch(signIn(email, password))
  },
  signUp: (email: string, name: string, password: string): void => {
    dispatch(registerUser(email, name, password))
  }
})

export const SignIn = connect(undefined, mapDispatchToProps)(SignInComponent)