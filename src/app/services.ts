import * as firebase from 'firebase/app'
import {CallbackStore} from '../state/callbackStore/callbackStore'

export interface Services {
  callbacks: CallbackStore,
  db: firebase.firestore.Firestore,
  auth: firebase.auth.Auth
}