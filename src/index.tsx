import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {App} from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { ConnectedRouter } from 'connected-react-router'
import { createStore, applyMiddleware} from 'redux'
import sagaMiddlewareFactory, {Effect} from 'redux-saga'
import {all, call} from 'redux-saga/effects'
import { Provider} from 'react-redux'
import { authSaga } from './state/auth/authActions'
import { gamesSaga } from './state/games/gamesActions'
import { reducer } from './state/'
import 'typeface-roboto'
import {userSignedIn, userSignedOut} from './state/auth/authActions'
import { createBrowserHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'

const history = createBrowserHistory()

const sagaMiddleware = sagaMiddlewareFactory()

const store = createStore(
  connectRouter(history)(reducer),
  applyMiddleware(
    routerMiddleware(history),
    sagaMiddleware
  )
)

function* rootSaga(): Iterator<Effect> {
  yield all([
    call(authSaga),
    call(gamesSaga)
  ])
}
sagaMiddleware.run(rootSaga)

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

if(!firebase.auth().currentUser){
  store.dispatch(userSignedOut())
}

firebase.auth().onAuthStateChanged(user => {
  if(user){
    console.log('user signed in')
    store.dispatch(userSignedIn(user))
  }
  else {
    console.log('user signed out')
    store.dispatch(userSignedOut())
  }
})

// const ui = new firebaseui.state.auth.AuthUI(firebase.state.auth());

// const uiConfig = {
//   callbacks: {
//     signInSuccessWithAuthResult: function(authResult: any, redirectUrl: any) {
//       // User successfully signed in.
//       // Return type determines whether we continue the redirect automatically
//       // or whether we leave that to developer to handle.
//       return true;
//     },
//     uiShown: function() {
//       // The widget is rendered.
//       // Hide the loader.
//       // document.getElementById('loader')!.style.display = 'none';
//     }
//   },
//   // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
//   signInFlow: 'popup',
//   signInSuccessUrl: '<url-to-redirect-to-on-success>',
//   signInOptions: [
//     // Leave the lines as is for the providers you want to offer your users.
//     firebase.state.auth.GoogleAuthProvider.PROVIDER_ID,
//     firebase.state.auth.FacebookAuthProvider.PROVIDER_ID,
//     firebase.state.auth.TwitterAuthProvider.PROVIDER_ID,
//     firebase.state.auth.GithubAuthProvider.PROVIDER_ID,
//     firebase.state.auth.EmailAuthProvider.PROVIDER_ID,
//     firebase.state.auth.PhoneAuthProvider.PROVIDER_ID
//   ],
//   // Terms of service url.
//   tosUrl: '<your-tos-url>'
// };

// ui.start('#login', uiConfig);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
)

registerServiceWorker()
