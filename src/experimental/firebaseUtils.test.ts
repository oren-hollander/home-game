import * as firebase from 'firebase/app'

import { Collection } from './firebaseUtils'

test.skip('Collection', async () => {
  interface Game {
    id?: string
    x: number
  }

  const config = {
    apiKey: 'AIzaSyCL0jL94GPb7HvZxUgZdnpqqyx5liMeY3A',
    authDomain: 'fire-base-test-4304c.firebaseapp.com',
    databaseURL: 'https://fire-base-test-4304c.firebaseio.com',
    projectId: 'fire-base-test-4304c',
    storageBucket: 'fire-base-test-4304c.appspot.com',
    messagingSenderId: '223479729697'
  }

  firebase.initializeApp(config)

  const firestore = firebase.firestore()
  const settings = {
    timestampsInSnapshots: true
  }

  firestore.settings(settings)
  const col: Collection<Game> = Collection(firestore.collection('games'))
  const id = await col.add({ x: 42 })
  const game = await col.get(id)
  console.log(game)
})
