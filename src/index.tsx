import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {App} from './app/App'
import {Redirect, Route, Switch} from 'react-router-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { createStore, applyMiddleware} from 'redux'
import {connect, MapDispatchToProps, MapStateToProps, Provider} from 'react-redux'
import {reducer, State} from './state/'
import 'typeface-roboto'
import {userSignedIn, userSignedOut, verifyEmail} from './state/auth/authActions'
import { createBrowserHistory } from 'history'
import { connectRouter, routerMiddleware, ConnectedRouter } from 'connected-react-router'
import {createEffectsMiddleware, combineEffectHandlers, EffectHandler} from './effect/effect'
import {friendsEffects} from './state/friends/friendsActions'
import {authEffects} from './state/auth/authActions'
import {gamesEffects} from './state/games/gamesActions'
import {usersEffects} from './state/users/usersActions'
import {Component} from 'react'
import {RouteComponentProps} from 'react-router'
import Typography from '@material-ui/core/Typography'
import {isEmailVerified} from './state/auth/authReducer'
import {parse} from 'query-string'

const history = createBrowserHistory()

const config = {
  apiKey: "AIzaSyCL0jL94GPb7HvZxUgZdnpqqyx5liMeY3A",
  authDomain: "fire-base-test-4304c.firebaseapp.com",
  databaseURL: "https://fire-base-test-4304c.firebaseio.com",
  projectId: "fire-base-test-4304c",
  storageBucket: "fire-base-test-4304c.appspot.com",
  messagingSenderId: "223479729697"
}

firebase.initializeApp(config)
const firestore = firebase.firestore()
const settings = {
  timestampsInSnapshots: true
}

firestore.settings(settings)

const services = {
  db: firestore,
  auth: firebase.auth()
}

const effects: EffectHandler = combineEffectHandlers(friendsEffects, authEffects, gamesEffects, usersEffects)

const store = createStore(
  connectRouter(history)(reducer),
  applyMiddleware(
    routerMiddleware(history),
    createEffectsMiddleware(effects, services)
  )
)

if(!firebase.auth().currentUser){
  store.dispatch(userSignedOut())
}

firebase.auth().onAuthStateChanged(user => {
  if(user){
    store.dispatch(userSignedIn(user))
  }
  else {
    store.dispatch(userSignedOut())
  }
})

interface AuthStateProps {
  verified: boolean
}

interface AuthDispatchProps {
  verifyEmail: (oobCode: string) => void
}

type AuthProps = RouteComponentProps<{}> & AuthStateProps & AuthDispatchProps

class AuthComponent extends Component<AuthProps>{

  componentDidMount(){
    const query = parse(this.props.location.search)
    if(query.mode === 'verifyEmail')
      this.props.verifyEmail(query.oobCode)
  }

  render() {
    if(this.props.verified)
      return <Redirect to='/'/>

    return <Typography>Verifying...</Typography>
  }
}

const mapStateToProps: MapStateToProps<AuthStateProps, {}, State> = state => ({
  verified: isEmailVerified(state)
})

const mapDispatchToProps: MapDispatchToProps<AuthDispatchProps, {}> = dispatch => ({
  verifyEmail(oobCode: string) {
    dispatch(verifyEmail(oobCode))
  }
})

const Auth = connect(mapStateToProps, mapDispatchToProps)(AuthComponent)

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/auth" component={Auth}/>
        <Route component={App}/>
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
)

registerServiceWorker()
