import * as React from 'react'
import { Component } from 'react'
import { RouteComponentProps } from 'react-router'
import { Redirect } from 'react-router-dom'
import { parse } from 'query-string'
import Typography from '@material-ui/core/Typography'
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
import { State } from '../state'
import { isEmailVerified } from './authReducer'
import { verifyEmail, resetPassword } from './authActions'

interface AuthStateProps {
  verified: boolean
}

interface AuthDispatchProps {
  verifyEmail: (oobCode: string) => void,
  resetPassword: (oobCode: string) => void
}

type AuthProps = RouteComponentProps<{}> & AuthStateProps & AuthDispatchProps

class AuthComponent extends Component<AuthProps>{

  componentDidMount() {
    const query = parse(this.props.location.search)
    switch(query.mode) {
      case 'verifyEmail':
        this.props.verifyEmail(query.oobCode)
        break
      case 'resetPassword': 
        this.props.resetPassword(query.oobCode)
    }
  }

  render() {
    if (this.props.verified)
      return <Redirect to='/' />

    return <Typography>Verifying...</Typography>
  }
}

const mapStateToProps: MapStateToProps<AuthStateProps, {}, State> = state => ({
  verified: isEmailVerified(state)
})

const mapDispatchToProps: MapDispatchToProps<AuthDispatchProps, {}> = dispatch => ({
  verifyEmail(oobCode: string) {
    dispatch(verifyEmail(oobCode))
  },
  resetPassword(oobCode: string) {
    dispatch(resetPassword(oobCode))
  }
})

export const Auth = connect(mapStateToProps, mapDispatchToProps)(AuthComponent)
