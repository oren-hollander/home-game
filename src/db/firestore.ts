import * as firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

export const testConfig = {
  apiKey: "AIzaSyBJaSh3bBTNiVUqRDpdU8xtr3GRv3gw-F4",
  authDomain: "home-game-test.firebaseapp.com",
  databaseURL: "https://home-game-test.firebaseio.com",
  projectId: "home-game-test",
  storageBucket: "home-game-test.appspot.com",
  messagingSenderId: "238379394063"

}

export const productionConfig = {
    apiKey: "AIzaSyCL0jL94GPb7HvZxUgZdnpqqyx5liMeY3A",
    authDomain: "fire-base-test-4304c.firebaseapp.com",
    databaseURL: "https://fire-base-test-4304c.firebaseio.com",
    projectId: "fire-base-test-4304c",
    storageBucket: "fire-base-test-4304c.appspot.com",
    messagingSenderId: "223479729697"
}

const password = '123456'
const getUserEmail = (name: string) => `${name}@homegame.app`

export const Firestore = (config: object): firebase.firestore.Firestore => {
  firebase.initializeApp(config)

  const firestore = firebase.firestore()

  const settings = {
    timestampsInSnapshots: true
  }

  firestore.settings(settings);
  return firestore
}

export const signInAsUser = async (userName: string): Promise<string> => {
  const email = getUserEmail(userName)
  const auth = firebase.auth()
  if (auth.currentUser && auth.currentUser.email === email) {
    return auth.currentUser.uid
  }
  else {
    await auth.signOut()
    const credentials = await auth.signInWithEmailAndPassword(email, password)
    return credentials.user!.uid
  }
}

export const createUser = async (userName: string): Promise<string> => {
  try {
    return await signInAsUser(userName)
  }
  catch (e) {
    const email = getUserEmail(userName)
    const credentials = await firebase.auth().createUserWithEmailAndPassword(email, password)
    return credentials.user!.uid
  }
}

export const deleteUser = async (userName: string): Promise<void> => {
  await signInAsUser(userName)
  await firebase.auth().currentUser!.delete()
}

export const signInAsAdmin = async (): Promise<void> => {
  await signInAsUser('test-master')
}