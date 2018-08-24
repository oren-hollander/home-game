import * as firebase from 'firebase/app'
import 'firebase/auth'
import { GamesDB } from './gamesDB'
import { GamesDatabase } from './types'
import { Game, Invitation } from '../model/types'
import { Firestore } from '../app/firestore'
import { Schema, deleteDocuments, getDocumentRefs } from './deleteDatabase'
import { set } from 'lodash/fp'

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

  const signIn = async (email: string): Promise<string> => {
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

  const signInAsAdmin = async (): Promise<string> => {
    const auth = firebase.auth()
    await auth.signInWithEmailAndPassword('oren.hollander@gmail.com', '123456')
    return auth.currentUser!.uid
  }


  beforeEach(async () => {
    await signInAsAdmin()

    const refs = await getDocumentRefs(firestore.collection.bind(firestore), schema)
    await deleteDocuments(firestore, refs)

    db = GamesDB(firestore)
  })
 
  describe('create user', () => {
    test('should create a new user', async () => {
      const userId = await signIn('test-user-1@homegame.app')
      await db.createUser({ userId, name: 'Some User' })
      const dbUser = await db.getUser(userId)
      expect(dbUser).not.toBeUndefined()
      expect(dbUser!.name).toBe('Some User')
      expect(dbUser!.userId).toBe(userId)
    })  

    test('should create Address', async () => {
      const userId = await signIn('test-user-1@homegame.app')
      await db.createUser({ userId, name: 'Some User' })
      await db.createAddress(userId, {
        label: 'Home',
        city: 'NY',
        houseNumber: '1A',
        street: 'Main'
      })
 
      await db.createAddress(userId, {
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
          label: 'Work',
          city: 'NY',
          houseNumber: '200',
          street: '5th',
          notes: 'Code: 1234'
        },
        {
          label: 'Home',
          city: 'NY',
          houseNumber: '1A',
          street: 'Main'
        }
      ]))
    }) 

    test('should create friend invitation', async () => {
      const userId = await signIn('test-user-1@homegame.app')
      await db.createUser({ userId, name: 'Some User' })
      const invitationId = await db.createFriendInvitation(userId)

      await signInAsAdmin()

      const invitationSnapshot = await firestore.collection('users').doc(userId).collection('friendInvitations').doc(invitationId).get()
      expect(invitationSnapshot.exists).toBe(true)
    })

    test('should accept friend invitation', async () => {
      const user1Id = await signIn('test-user-1@homegame.app')
      await db.createUser({ userId: user1Id, name: 'User A' })
      const invitationId = await db.createFriendInvitation(user1Id)

      const user2Id = await signIn('test-user-2@homegame.app')
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
      const user1Id = await signIn('test-user-1@homegame.app')
      await db.createUser({ userId: user1Id, name: 'User 1' })

      const user2Id = await signIn('test-user-2@homegame.app')
      await db.createUser({ userId: user2Id, name: 'User 2' })

      const user3Id = await signIn('test-user-3@homegame.app')
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
      const user1Id = await signIn('test-user-1@homegame.app')
      await db.createUser({ userId: user1Id, name: 'User 1' })

      const user2Id = await signIn('test-user-2@homegame.app')
      await db.createUser({ userId: user2Id, name: 'User 2' })

      const user3Id = await signIn('test-user-3@homegame.app')
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
      const userId = await signIn('test-user@homegame.app')
      await db.createUser({ userId: userId, name: 'User 1' })
      
      const timestamp = firebase.firestore.Timestamp.now()
      const game: Game = {
        gameId: '',
        hostId: userId, 
        address: {
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
      const userId = await signIn('test-user@homegame.app')
      await db.createUser({ userId: userId, name: 'User 1' })

      const timestampBefore = firebase.firestore.Timestamp.now()
      
      const game = await db.createGame({
        gameId: '',
        hostId: userId,
        address: {
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
        timestamp: timestampBefore,
        type: 'PLO'
      }) 

      const timestampAfter = firebase.firestore.Timestamp.now()
      const updatedGame = set('timestamp', timestampAfter, game)
      
      await db.updateGame(updatedGame, false)

      await signInAsAdmin()

      const gameSnapshot = await firestore.collection('users').doc(userId).collection('games').doc(game.gameId).get()
      expect(gameSnapshot.exists).toBe(true)
      expect(gameSnapshot.data()).toEqual({
        hostId: userId,
        address: {
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

    test.only('invite to game', async () => {
      const user1Id = await signIn('test-user-1@homegame.app')
      await db.createUser({ userId: user1Id, name: 'User 1' })

      const user2Id = await signIn('test-user-2@homegame.app')
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

    test.skip('should update game with response invalidation', async () => {
      const userId = await signIn('test-user@homegame.app')
      await db.createUser({ userId: userId, name: 'User 1' })

      const timestampBefore = firebase.firestore.Timestamp.now()

      const game = await db.createGame({
        gameId: '',
        hostId: userId,
        address: {
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
        timestamp: timestampBefore,
        type: 'PLO'
      })

      const timestampAfter = firebase.firestore.Timestamp.now()
      const updatedGame = set('timestamp', timestampAfter, game)

      await db.updateGame(updatedGame, true)

      await signInAsAdmin()

      const gameSnapshot = await firestore.collection('users').doc(userId).collection('games').doc(game.gameId).get()
      expect(gameSnapshot.exists).toBe(true)
      expect(gameSnapshot.data()).toEqual({
        hostId: userId,
        address: {
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
  })
}) 