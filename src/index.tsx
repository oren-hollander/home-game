import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App } from './app/app/App'
import { Route, Switch } from 'react-router-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { reducer } from './app/state'
import 'typeface-roboto'
import { userSignedIn, userSignedOut } from './app/auth/authActions'
import { createBrowserHistory } from 'history'
import { connectRouter, routerMiddleware, ConnectedRouter } from 'connected-react-router'
import { createEffectsMiddleware, combineEffectHandlers, EffectHandler } from './effect/effect'
import { friendsEffects } from './app/friends/friendsActions'
import { authEffects } from './app/auth/authActions'
import { gamesEffects } from './app/games/gamesActions'
import { usersEffects } from './app/users/usersActions'
import { CallbackStore } from './services/callbackStore'
import { Firestore, productionConfig } from './db/firestore'
import { Auth } from './app/auth/Auth'

const history = createBrowserHistory()

const firestore = Firestore(productionConfig)

const services = {
  db: firestore,
  auth: firebase.auth(),
  callbacks: CallbackStore()
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