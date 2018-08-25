import * as firebase from 'firebase/app'
import 'firebase/firestore'
import { createGameEffect, createGame } from './gamesActions'
import { Game } from '../../model/types'
import { CallbackStore } from '../callbackStore/callbackStore'
import { Firestore, signInAsAdmin } from '../../app/firestore'

describe('game effects', () => {
  let db: firebase.firestore.Firestore

  beforeAll(async () => {
    db = Firestore()
    await signInAsAdmin()
  })
 
  test('createGameEffect', async () => {
    const game: Game = {
      hostId: 'oren.hollander@gmail.com',
      gameId: 'game',
      type: 'NLH',
      stakes: {smallBlind: 5, bigBlind: 5},
      maxPlayers: 8,
      timestamp: firebase.firestore.Timestamp.now(),
      address: {
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
