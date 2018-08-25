import * as firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

export const Firestore = (): firebase.firestore.Firestore => {

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

  firestore.settings(settings);
  return firestore
}

export const setUser = async (email: string): Promise<string> => {
  const password = '123456'
  const auth = firebase.auth()
  if (auth.currentUser && auth.currentUser.email === email) {
    return auth.currentUser.uid
  }
  else {
    await auth.signOut()
    try {
      await auth.signInWithEmailAndPassword(email, password)
      return auth.currentUser!.uid
    }
    catch (e) {
      switch (e.code) {
        case 'auth/user-not-found':
          await auth.createUserWithEmailAndPassword(email, password)
          return auth.currentUser!.uid
        default:
          throw e
      }
    }
  }
}

export const signInAsAdmin = async (): Promise<string> => {
  const email = 'oren.hollander@gmail.com'
  const password: string = '123456'
  if (password === '') {
    throw new Error('Please set admin password')
  }

  const auth = firebase.auth()
  await auth.signInWithEmailAndPassword(email, password)
  return auth.currentUser!.uid
}
