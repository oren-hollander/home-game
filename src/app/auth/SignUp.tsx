import * as React from 'react'
import { ChangeEvent, Component } from 'react'
import Button from '@material-ui/core/Button'
import { connect, MapDispatchToProps } from 'react-redux'
import { registerUser } from '../auth/authActions'
import { ThunkDispatch } from 'redux-thunk'
import { State, HomeGameAction} from '../state'
import { Services } from '../../services/services'

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
      email: '',
      name: '',
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
        <div>
          <div>
            <label>
              Email
              <input type="email" placeholder="email" onChange={this.updateField('email')} />
            </label>
          </div>
          <div>
            <label>
              Name
              <input type="text" placeholder="name" onChange={this.updateField('name')} />
            </label>
          </div>
          <div>
            <label>
              Password
              <input type="password" placeholder="password" onChange={this.updateField('password')} />
            </label>
          </div>
          <Button color="primary" variant="contained" onClick={this.signUp}>
            Sign Up
          </Button>
        </div>
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