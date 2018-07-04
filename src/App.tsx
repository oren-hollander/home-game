import * as React from 'react'
import './App.css'
import logo from './logo.svg'
import {Route, Switch} from 'react-router-dom'
import { SignIn } from './state/auth/SignIn'
// import {connect} from 'react-redux'
// import {Component} from 'react'
// import {verifyEmail} from './state/auth/authActions'
// import { authSelectors } from './state'
// import {State} from './state'
import Typography from '@material-ui/core/Typography'

// const SignIn = () => <div>Sign In</div>

// class AuthActions extends Component<{emailVerified: boolean, verifyEmail: (oobCode: string) => void} & RouteComponentProps<{}>> {
//   componentDidMount() {
//     const params = new URLSearchParams(this.props.location.search)
//     if(params.get('mode') === 'verifyEmail'){
//       this.props.verifyEmail(params.get('oobCode')!)
//     }
//   }
//   render() {
//     return <div/>//<Redirect to='/'/>
//   }
// }

// const SmartAuthActions = connect(
//   (state: State) => ({
//     emailVerified: authSelectors.isEmailVerified(state)
//   }),
//   dispatch => ({
//     verifyEmail(oobCode: string){
//       dispatch(verifyEmail(oobCode))
//     }
//   })
// )(AuthActions)


const Games = () => <Typography variant="title" color="inherit">Games</Typography>

const NoMatch = () => <Typography variant="title" color="inherit">404</Typography>

export const App = () =>
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Welcome to React</h1>
      </header>
      <p className="App-intro">
        To get started, edit <code>src/App.tsx</code> and save to reload.
      </p>
      <Switch>
        <Route path='/' exact={true} component={SignIn}/>
        <Route path='/games' component={Games}/>
        <Route component={NoMatch}/>

      </Switch>
    </div>
