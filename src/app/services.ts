import * as firebase from 'firebase/app'

export interface Services {
  db: firebase.firestore.Firestore,
  auth: firebase.auth.Auth
}