import * as firebase from 'firebase/app'
import 'firebase/firestore'
import { createGame } from './gamesActions'
import { Game } from '../../db/types'
import { CallbackStore } from '../../services/callbackStore'
import { Firestore, signInAsAdmin, testConfig } from '../../db/firestore'
import { GamesDatabase } from '../../db/gamesDB'

describe.skip('game effects', () => {
  let db: GamesDatabase

  beforeAll(async () => {
    db = GamesDatabase(Firestore(testConfig))
    await signInAsAdmin()
  })

  test('createGame', async () => {
    const game: Game = {
      hostId: 'xyz',
      hostName: 'Host',
      gameId: 'game',
      description: '5/5 NLH, 8 players max',
      timestamp: firebase.firestore.Timestamp.now(),
      address: {
        addressId: '',
        label: 'home',
        houseNumber: '42b',
        street: 'main',
        city: 'NY'
      }
    }

    const dispatch = jest.fn()
    const getState = jest.fn()

    return createGame(game.timestamp, game.address, game.description)(dispatch, getState, {
      db,
      auth: firebase.auth(),
      callbacks: CallbackStore()
    })
  })
})
