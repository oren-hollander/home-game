import * as firebase from 'firebase/app'
import 'firebase/auth'
import { GamesDB } from './gamesDB'
import { GamesDatabase } from './types'
import { Game, Invitation, InvitationResponse } from '../model/types'
import { Firestore, setUser, signInAsAdmin } from '../app/firestore'
import { Schema, deleteDocuments, getDocumentRefs } from './deleteDatabase'
import { set, map, noop } from 'lodash/fp'

const schema: Schema = {
  users: {
    friends: {},
    friendInvitations: {},
    addresses: {},
    games: {
      invitations: {},
      responses: {}
    },
    invitations: {}
  }
}

type Firestore = firebase.firestore.Firestore

describe('games database', () => {
  let firestore: firebase.firestore.Firestore
  let db: GamesDatabase 

  beforeAll(() => {
    jest.setTimeout(30000)
    firestore = Firestore()
  })

  const createGame = async (userId: string, timestamp: firebase.firestore.Timestamp): Promise<Game> => 
    db.createGame({
      gameId: '',
      hostId: userId,
      address: {
        addressId: '',
        label: 'Home',
        city: 'NY',
        houseNumber: '1',
        street: 'Main'
      },
      maxPlayers: 8,
      stakes: {
        smallBlind: 5,
        bigBlind: 5
      },
      timestamp,
      type: 'PLO'
    })

  beforeEach(async () => {
    await signInAsAdmin()

    const refs = await getDocumentRefs(firestore.collection.bind(firestore), schema)
    await deleteDocuments(firestore, refs)

    db = GamesDB(firestore)
  })
 
  describe('create user', () => {
    test('should create a new user', async () => {
      const userId = await setUser('test-user-1@homegame.app')
      await db.createUser({ userId, name: 'Some User' })
      const dbUser = await db.getUser(userId)
      expect(dbUser).not.toBeUndefined()
      expect(dbUser!.name).toBe('Some User')
      expect(dbUser!.userId).toBe(userId)
    })  

    test('should create Address', async () => {
      const userId = await setUser('test-user-1@homegame.app')
      await db.createUser({ userId, name: 'Some User' })
      await db.createAddress(userId, {
        addressId: '',
        label: 'Home',
        city: 'NY',
        houseNumber: '1A',
        street: 'Main'
      })
 
      await db.createAddress(userId, {
        addressId: '',
        label: 'Work',
        city: 'NY',
        houseNumber: '200',
        street: '5th',
        notes: 'Code: 1234'
      })

      const addresses = await db.getAddresses(userId)
      expect(addresses.length).toBe(2)
      expect(addresses).toEqual(expect.arrayContaining([
        {
          addressId: expect.any(String),
          label: 'Work',
          city: 'NY',
          houseNumber: '200',
          street: '5th',
          notes: 'Code: 1234'
        },
        {
          addressId: expect.any(String),
          label: 'Home',
          city: 'NY',
          houseNumber: '1A',
          street: 'Main'
        }
      ]))
    }) 

    test('should create friend invitation', async () => {
      const userId = await setUser('test-user-1@homegame.app')
      await db.createUser({ userId, name: 'Some User' })
      const invitationId = await db.createFriendInvitation(userId)

      await signInAsAdmin()

      const invitationSnapshot = await firestore.collection('users').doc(userId).collection('friendInvitations').doc(invitationId).get()
      expect(invitationSnapshot.exists).toBe(true)
    })

    test('should accept friend invitation', async () => {
      const user1Id = await setUser('test-user-1@homegame.app')
      await db.createUser({ userId: user1Id, name: 'User A' })
      const invitationId = await db.createFriendInvitation(user1Id)

      const user2Id = await setUser('test-user-2@homegame.app')
      await db.createUser({ userId: user2Id, name: 'User B' })
      await db.acceptFriendInvitation(user2Id, invitationId, user1Id)
      
      await signInAsAdmin()

      const [invitationSnapshot, user1HasUser2, user2HasUser1] = await Promise.all([
        firestore.collection('users').doc(user1Id).collection('friendInvitations').doc(invitationId).get(),
        firestore.collection('users').doc(user1Id).collection('friends').doc(user2Id).get(),
        firestore.collection('users').doc(user2Id).collection('friends').doc(user1Id).get()
      ])

      expect(invitationSnapshot.exists).toBe(false)
      expect(user1HasUser2.exists).toBe(true)
      expect(user2HasUser1.exists).toBe(true)
    }) 

    test('should add friend', async () => {
      const user1Id = await setUser('test-user-1@homegame.app')
      await db.createUser({ userId: user1Id, name: 'User 1' })

      const user2Id = await setUser('test-user-2@homegame.app')
      await db.createUser({ userId: user2Id, name: 'User 2' })

      const user3Id = await setUser('test-user-3@homegame.app')
      await db.createUser({ userId: user3Id, name: 'User 3' })

      await db.addFriend(user3Id, user1Id)
      await db.addFriend(user3Id, user2Id)

      const friends = await db.getFriends(user3Id)
      expect(friends.length).toBe(2)
      expect(friends).toEqual(expect.arrayContaining([
        {
          userId: user1Id,
          name: 'User 1'
        },
        {
          userId: user2Id,
          name: 'User 2'
        }
      ]))
    })

    test('should remove friend', async () => {
      const user1Id = await setUser('test-user-1@homegame.app')
      await db.createUser({ userId: user1Id, name: 'User 1' })

      const user2Id = await setUser('test-user-2@homegame.app')
      await db.createUser({ userId: user2Id, name: 'User 2' })

      const user3Id = await setUser('test-user-3@homegame.app')
      await db.createUser({ userId: user3Id, name: 'User 3' })

      await db.addFriend(user3Id, user1Id)
      await db.addFriend(user3Id, user2Id)
      await db.removeFriend(user3Id, user1Id)

      const friends = await db.getFriends(user3Id)
      expect(friends).toEqual([
        {
          userId: user2Id,
          name: 'User 2'
        }
      ]) 
    })

    test('should create game', async () => {
      const userId = await setUser('test-user@homegame.app')
      await db.createUser({ userId: userId, name: 'User 1' })
      
      const timestamp = firebase.firestore.Timestamp.now()
      const game: Game = {
        gameId: '',
        hostId: userId, 
        address: {
          addressId: '',
          label: 'Home',
          city: 'NY',
          houseNumber: '1',
          street: 'Main'
        },
        maxPlayers: 8,
        stakes: {
          smallBlind: 5,
          bigBlind: 5
        },
        timestamp,
        type: 'PLO'
      }

      const { gameId } = await db.createGame(game)
      
      await signInAsAdmin()

      const gameSnapshot = await firestore.collection('users').doc(userId).collection('games').doc(gameId).get()
      expect(gameSnapshot.exists).toBe(true)
      expect(gameSnapshot.data()).toEqual({
        hostId: userId,
        address: {
          addressId: expect.any(String),
          label: 'Home',
          city: 'NY',
          houseNumber: '1',
          street: 'Main'
        },
        maxPlayers: 8,
        stakes: {
          smallBlind: 5,
          bigBlind: 5
        },
        timestamp,
        type: 'PLO'
      })
    })

    test('should update game without response invalidation', async () => {
      const userId = await setUser('test-user@homegame.app')
      await db.createUser({ userId: userId, name: 'User 1' })

      const timestampBefore = firebase.firestore.Timestamp.now()
      
      const game = await createGame(userId, timestampBefore) 

      const timestampAfter = firebase.firestore.Timestamp.now()
      const updatedGame = set('timestamp', timestampAfter, game)
      
      await db.updateGame(updatedGame)

      await signInAsAdmin()

      const gameSnapshot = await firestore.collection('users').doc(userId).collection('games').doc(game.gameId).get()
      expect(gameSnapshot.exists).toBe(true)
      expect(gameSnapshot.data()).toEqual({
        hostId: userId,
        address: {
          addressId: expect.any(String),
          label: 'Home',
          city: 'NY',
          houseNumber: '1',
          street: 'Main'
        },
        maxPlayers: 8,
        stakes: {
          smallBlind: 5,
          bigBlind: 5
        },
        timestamp: timestampAfter,
        type: 'PLO'
      })

    })

    test('invite to game', async () => {
      const user1Id = await setUser('test-user-1@homegame.app')
      await db.createUser({ userId: user1Id, name: 'User 1' })

      const user2Id = await setUser('test-user-2@homegame.app')
      await db.createUser({ userId: user2Id, name: 'User 2' })

      await db.addFriend(user2Id, user1Id)

      const game = await createGame(user2Id, firebase.firestore.Timestamp.now())

      const invitation: Invitation = {
        hostId: user2Id,
        gameId: game.gameId
      }

      await db.inviteToGame(user1Id, invitation)

      await signInAsAdmin()

      const snapshot = await firestore.collection('users').doc(user2Id).collection('games').doc(game.gameId).collection('invitations').doc(user1Id).get()
      expect(snapshot.exists).toBe(true)
      
      const querySnapshot = await firestore.collection('users').doc(user1Id).collection('invitations').get()
      expect(querySnapshot.docs.length).toBe(1)
      expect(querySnapshot.docs[0].data()).toEqual(invitation) 
    }) 

    test('shoud accept invitation', async () => {
      const user1Id = await setUser('test-user-1@homegame.app')
      await db.createUser({ userId: user1Id, name: 'User 1' })

      const user2Id = await setUser('test-user-2@homegame.app')
      await db.createUser({ userId: user2Id, name: 'User 2' })

      await db.addFriend(user2Id, user1Id)

      const game = await createGame(user2Id, firebase.firestore.Timestamp.now())

      const invitation: Invitation = {
        hostId: user2Id,
        gameId: game.gameId
      }

      await db.inviteToGame(user1Id, invitation)

      await setUser('test-user-1@homegame.app')

      const timestamp = firebase.firestore.Timestamp.now()

      const invitationResponse: InvitationResponse = {
        gameId: game.gameId,
        hostId: user2Id,
        playerId: user1Id,
        timestamp,
        status: 'approved',
        valid: true
      }

      await db.respondToGameInvitation(invitationResponse)

      await signInAsAdmin()

      const snapshot = await firestore.collection('users').doc(user2Id).collection('games').doc(game.gameId).collection('responses').get()
      expect(snapshot.docs.length).toBe(1)

      const docs = map(snapshot => snapshot.data(), snapshot.docs)
 
      expect(docs).toEqual(expect.arrayContaining([
        {
          status: 'approved',
          timestamp, 
          valid: true
        }
      ]))
    })

    test('whole flow', async () => {
      const user1Id = await setUser('test-user-1@homegame.app')
      await db.createUser({ userId: user1Id, name: 'User 1' })

      const user2Id = await setUser('test-user-2@homegame.app')
      await db.createUser({ userId: user2Id, name: 'User 2' })

      const timestampBefore = firebase.firestore.Timestamp.now()
      const game = await createGame(user2Id, timestampBefore)

      await db.inviteToGame(user1Id, {
        gameId: game.gameId,
        hostId: user2Id
      })

      await setUser('test-user-1@homegame.app')

      await db.respondToGameInvitation({
        gameId: game.gameId,
        hostId: user2Id,
        playerId: user1Id,
        status: 'approved',
        timestamp: firebase.firestore.Timestamp.now(),
        valid: true
      })

      await setUser('test-user-2@homegame.app')

      const timestampAfter = firebase.firestore.Timestamp.now()
      const updatedGame = set('timestamp', timestampAfter, game)

      await db.updateGame(updatedGame)
      await db.invalidateResponses(user2Id, game.gameId)
 
      await signInAsAdmin()

      const gameSnapshot = await firestore.collection('users').doc(user2Id).collection('games').doc(game.gameId).get()
      expect(gameSnapshot.exists).toBe(true) 
      expect(gameSnapshot.data()!.timestamp).toEqual(timestampAfter)
      
      const invalidResponse = await firestore.collection('users').doc(user2Id).collection('games').doc(game.gameId).collection('responses').doc(user1Id).get()
      expect(invalidResponse.get('valid')).toEqual(false) 

      await setUser('test-user-1@homegame.app')
      await db.validateResponse(user1Id, user2Id, game.gameId)

      await signInAsAdmin()

      const validResponse = await firestore.collection('users').doc(user2Id).collection('games').doc(game.gameId).collection('responses').doc(user1Id).get()
      expect(validResponse.get('valid')).toEqual(true) 
    })

    test('listen to games', async () => {      
      const playerEmail = 'player@homegame.app'
      const hostEmail = 'host@homegame.com'

      const playerId = await setUser(playerEmail)
      await db.createUser({ userId: playerId, name: 'Player' })
      const playerGame = await createGame(playerId, firebase.firestore.Timestamp.now())

      const hostId = await setUser(hostEmail)
      await db.createUser({ userId: hostId, name: 'Host' })

      const hostGame = await createGame(hostId, firebase.firestore.Timestamp.now())

      await signInAsAdmin()
      let unsubscribe: () => void = noop
      const promise = new Promise<ReadonlyArray<Game>>(resolve => {
        unsubscribe = db.listenToGames(playerId, games => {
          resolve(games) 
        })
      })

      await db.inviteToGame(playerId, { gameId: hostGame.gameId, hostId })   
 
      const games = await promise
      expect(games.length).toBe(2) 
      expect(games).toEqual(expect.arrayContaining([
        playerGame, 
        hostGame
      ])) 
      unsubscribe()
    }) 

    test('listen to game', async () => {
      const playerEmail = 'player@homegame.app'
      const hostEmail = 'host@homegame.com'

      const playerId = await setUser(playerEmail)
      await db.createUser({ userId: playerId, name: 'Player' })

      const hostId = await setUser(hostEmail)
      await db.createUser({ userId: hostId, name: 'Host' })

      const game = await createGame(hostId, firebase.firestore.Timestamp.now())

      await db.inviteToGame(playerId, { hostId, gameId: game.gameId })

      await setUser(playerEmail)

      await signInAsAdmin()

      
      interface GameEventData {
        game: Game
        invitations: ReadonlyArray<string>
        responses: ReadonlyArray<InvitationResponse>
      }

      let unsubscribe: () => void = noop

      const promise = new Promise<GameEventData>(resolve => {
        unsubscribe = db.listenToGame(hostId, game.gameId, (game, invitations, responses) => {
          resolve({ game, invitations, responses })
        })
      })

      const r = await promise
      expect(r.game.hostId).toEqual(hostId)
      expect(r.invitations).toEqual([playerId])
      expect(r.responses).toEqual([])
      unsubscribe()
    })
  })
})