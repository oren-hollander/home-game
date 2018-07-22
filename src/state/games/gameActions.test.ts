import * as firebase from 'firebase/app'
import 'firebase/firestore'
import {createGameEffect, createGame} from './gamesActions'
import {Game} from '../../model/types'

describe('game effects', () => {
  let db: firebase.firestore.Firestore

  beforeEach(() => {
    const config = {
      apiKey: "AIzaSyCL0jL94GPb7HvZxUgZdnpqqyx5liMeY3A",
      authDomain: "fire-base-test-4304c.firebaseapp.com",
      databaseURL: "https://fire-base-test-4304c.firebaseio.com",
      projectId: "fire-base-test-4304c",
      storageBucket: "fire-base-test-4304c.appspot.com",
      messagingSenderId: "223479729697"
    }

    firebase.initializeApp(config)
    db = firebase.firestore()
    const settings = {
      timestampsInSnapshots: true
    }

    db.settings(settings)
  })

  test('createGameEffect', async () => {
    const game: Game = {
      hostId: 'oren.hollander@gmail.com',
      gameId: 'game',
      type: 'NLH',
      stakes: {smallBlind: 5, bigBlind: 5},
      maxPlayers: 8,
      date: {year: 2018, month: 7, day: 4},
      time: {hour: 20, minute: 45},
      address: {
        houseNumber: '42b',
        street: 'main',
        city: 'NY'
      }
    }

    const store = {
      dispatch: jest.fn(),
      getState: jest.fn()
    }

    return createGameEffect(createGame(game), store, {db, auth: undefined!})
  })
})
