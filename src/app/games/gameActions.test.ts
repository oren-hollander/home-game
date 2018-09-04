import * as firebase from 'firebase/app'
import 'firebase/firestore'
import { createGameEffect } from './gamesActions'
import { Game } from '../../db/types'
import { CallbackStore } from '../../services/callbackStore'
import { Firestore, signInAsAdmin, testConfig } from '../../db/firestore'
import { GamesDatabase } from '../../db/gamesDB';

describe.skip('game effects', () => {
  let db: firebase.firestore.Firestore
  let gamesDb: GamesDatabase 

  beforeAll(async () => {
    db = Firestore(testConfig)
    gamesDb = GamesDatabase(db)
    await signInAsAdmin()
  })
 
  test('createGameEffect', async () => {
    const game: Game = {
      hostId: 'host@homegame.app',
      gameId: 'game',
      type: 'NLH',
      stakes: {smallBlind: 5, bigBlind: 5},
      maxPlayers: 8,
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

    return createGameEffect(game)(dispatch, getState, { db, gamesDb, auth: firebase.auth(), callbacks: CallbackStore()})
  })
})
