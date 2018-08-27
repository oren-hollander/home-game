import * as firebase from 'firebase/app'
import 'firebase/firestore'
import { createGameEffect, createGame } from './gamesActions'
import { Game } from '../../db/types'
import { CallbackStore } from '../app/callbackStore'
import { Firestore, signInAsAdmin, testConfig } from '../app/firestore'

describe.skip('game effects', () => {
  let db: firebase.firestore.Firestore

  beforeAll(async () => {
    db = Firestore(testConfig)
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

    const store = {
      dispatch: jest.fn(),
      getState: jest.fn()
    }

    return createGameEffect(createGame(game), store, {db, auth: firebase.auth(), callbacks: CallbackStore()})
  })
})
