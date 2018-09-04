import * as React from 'react'
import { Component, SFC, ComponentType, ChangeEvent } from 'react'
import { RouteComponentProps } from 'react-router'
import { parse } from 'query-string'
import { connect, MapDispatchToProps } from 'react-redux'
import { HomeGameThunkDispatch } from '../state'
import { verifyEmail, resetPassword } from './authActions'
import { Page } from '../../ui/page'
import { Toolbar } from '../../ui/toolbar'
import { StatusBar } from '../../ui/statusBar'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'

namespace UI {
  interface StateProps {
    oobCode: string
  }

  interface VerifyEmailDispatchProps {
    verifyEmail: (oobCode: string) => void,
  }

  interface ResetPasswordDispatchProps {
    resetPassword: (oobCode: string, password: string) => void,
  }

  type VerifyEmailProps = StateProps & VerifyEmailDispatchProps
  type ResetPasswordProps = StateProps & ResetPasswordDispatchProps

  namespace VerifyEmailUI {
    export class VerifyEmail extends Component<VerifyEmailProps> {
      componentDidMount() {
        this.props.verifyEmail(this.props.oobCode)
      }
      render(){
        return <div>Verifying email...</div>
      }
    }

    export const mapDispatchToProps: MapDispatchToProps<VerifyEmailDispatchProps, {}> = (dispatch: HomeGameThunkDispatch): VerifyEmailDispatchProps => ({
      verifyEmail(oobCode: string): void {
        dispatch(verifyEmail(oobCode))
      }
    })
  }

  namespace ResetPasswordUI {
    interface ResetPasswordState {
      password: string
    }

    export class ResetPassword extends Component<ResetPasswordProps> {
      state: ResetPasswordState = {
        password: ''
      }

      updatePassword = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({ password: e.target.value })
      }

      resetPassword = () => {
        this.props.resetPassword(this.props.oobCode, this.state.password)
      }

      render() {
        return (
          <>
            <label>
              New Password
              <input type="password" placeholder="password" onChange={this.updatePassword} />
              <Button color="primary" variant="contained" onClick={this.resetPassword}>
                Reset
              </Button>
            </label>
          </>
        )
      }
    }

    export const mapDispatchToProps: MapDispatchToProps<ResetPasswordDispatchProps, {}> = (dispatch: HomeGameThunkDispatch): ResetPasswordDispatchProps => ({
      resetPassword(oobCode: string, password: string): void {
        dispatch(resetPassword(oobCode, password))
      }
    })
  }

  export const VerifyEmail: ComponentType<StateProps> = connect(undefined, VerifyEmailUI.mapDispatchToProps)(VerifyEmailUI.VerifyEmail)
  export const ResetPassword: ComponentType<StateProps> = connect(undefined, ResetPasswordUI.mapDispatchToProps)(ResetPasswordUI.ResetPassword)
}

export const AuthHandler: SFC<RouteComponentProps<{}>> = ({ location: { search } }) => {

  const Handler: SFC = () => {
    const query = parse(search) as { mode: string, oobCode: string }
    switch (query.mode) {
      case 'verifyEmail':
        return <UI.VerifyEmail oobCode={query.oobCode} />
      case 'resetPassword':
        return <UI.ResetPassword oobCode={query.oobCode} />
      default:
        return null
    }
  } 

  return (
    <Page>
      <Toolbar>
        <Link to="/">Home</Link>
      </Toolbar>
      <Handler/>
      <StatusBar/>
    </Page>
  )
}

// const mapStateToProps: MapStateToProps<AuthStateProps, {}, State> = state => ({
//   verified: isEmailVerified(state)
// })

// const mapDispatchToProps: MapDispatchToProps<AuthDispatchProps, {}> = (dispatch: HomeGameThunkDispatch): AuthDispatchProps => ({
//   verifyEmail(oobCode: string) {
//     dispatch(verifyEmail(oobCode))
//   },
//   resetPassword(oobCode: string, password: string) {
//     dispatch(resetPassword(oobCode, password))
//   }
// })

// export const AuthHandler = connect(mapStateToProps, mapDispatchToProps)(UI.AuthHandler)
