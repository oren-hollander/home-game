import * as React from 'react'
import { render } from 'react-dom'
import { Route, Switch } from 'react-router-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { reducer } from './app/state'
import { userSignedIn, userSignedOut } from './app/auth/authActions'
import { createBrowserHistory } from 'history'
import { connectRouter, routerMiddleware, ConnectedRouter } from 'connected-react-router'
import { CallbackStore } from './services/callbackStore'
import { Firestore, productionConfig } from './db/firestore'
import { Authentication } from './app/auth/Authentication'
import { AuthHandler } from './app/auth/AuthHandler'
import { GamesDatabase } from './db/gamesDB'
import { Services } from './services/services'
import * as thunk from 'redux-thunk'
import { now, max, delay } from 'lodash/fp'
import 'bootstrap/dist/css/bootstrap.min.css'

const history = createBrowserHistory()

const firestore = Firestore(productionConfig)

const services: Services = {
  db: GamesDatabase(firestore),
  auth: firebase.auth(),
  callbacks: CallbackStore()
}

const store = createStore(
  connectRouter(history)(reducer),
  applyMiddleware(
    routerMiddleware(history),
    thunk.default.withExtraArgument(services)
  )
)

const ts = now()
firebase.auth().onAuthStateChanged(user => {
  if(user){
    store.dispatch(userSignedIn(user))
  }
  else {
    store.dispatch(userSignedOut())
  }
  const ms = max([0, 0 - (now() - ts)])!
  delay(ms, renderApp)
})

const renderApp = () => {
  render(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/auth" component={AuthHandler} />
          <Route component={Authentication} />
        </Switch>
      </ConnectedRouter>
    </Provider>,
    document.getElementById('root') as HTMLElement
  )

}

const Welcome = () => <div>Loading...</div>

render(<Welcome />, document.getElementById('root') as HTMLElement)

registerServiceWorker()