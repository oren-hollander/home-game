import * as firebase from 'firebase/app'
import 'firebase/auth'
import { GamesDatabase } from './gamesDB'
import { Game, Invitation, InvitationResponse } from './types'
import { Firestore, createUser, signInAsAdmin, deleteUser, testConfig, signInAsUser } from './firestore'
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
      timestamp,
      description: '5/5 PLO game'
    })

  const deleteDatabase = async () => {
    await signInAsAdmin()
    const refs = await getDocumentRefs(firestore.collection.bind(firestore), schema)
    await deleteDocuments(firestore, refs)
  }

  const host = 'host', player1 = 'player-1', player2 = 'player-2'
  const userNames = [host, player1, player2]
  
  const createUsers = async () => {
    await createUser(host)
    await createUser(player1)
    await createUser(player2)
  }

  const deleteUsers = async () => {
    await Promise.all(map(async name => deleteUser(name), userNames))
  }

  beforeAll(async () => {
    jest.setTimeout(30000)
    firestore = Firestore(testConfig)
    db = GamesDatabase(firestore)
    await createUsers()
  })

  beforeEach(async () => {
    await deleteDatabase()
  })

  afterAll(async () => {
    await deleteDatabase() 
    await deleteUsers()
  })
 
  test('should create a new user', async () => {
    const userId = await signInAsUser(host)
    await db.createUser({ userId, name: 'Host' })
    const dbUser = await db.getUser(userId)
    expect(dbUser).not.toBeUndefined()
    expect(dbUser!.name).toBe('Host')
    expect(dbUser!.userId).toBe(userId)
  })  

  test('should create Address', async () => {
    const userId = await signInAsUser(host)
    await db.createUser({ userId, name: 'Host' })
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
    const userId = await signInAsUser(host)
    await db.createUser({ userId, name: 'Host' })
    const invitationId = await db.createFriendInvitation(userId)

    await signInAsAdmin()

    const invitationSnapshot = await firestore.collection('users').doc(userId).collection('friendInvitations').doc(invitationId).get()
    expect(invitationSnapshot.exists).toBe(true)
  })

  test('should accept friend invitation', async () => {
    const hostId = await signInAsUser(host)
    await db.createUser({ userId: hostId, name: 'Host' })
    const invitationId = await db.createFriendInvitation(hostId)

    const player1Id = await signInAsUser(player1)
    await db.createUser({ userId: player1Id, name: 'Player 1' })
    await db.acceptFriendInvitation(player1Id, invitationId, hostId)
    
    await signInAsAdmin()

    const [invitationSnapshot, user1HasUser2, user2HasUser1] = await Promise.all([
      firestore.collection('users').doc(hostId).collection('friendInvitations').doc(invitationId).get(),
      firestore.collection('users').doc(hostId).collection('friends').doc(player1Id).get(),
      firestore.collection('users').doc(player1Id).collection('friends').doc(hostId).get()
    ])

    expect(invitationSnapshot.exists).toBe(false)
    expect(user1HasUser2.exists).toBe(true)
    expect(user2HasUser1.exists).toBe(true)
  }) 

  test('should add friend', async () => {
    const hostId = await signInAsUser(host)
    await db.createUser({ userId: hostId, name: 'Host' })

    const player1Id = await signInAsUser(player1)
    await db.createUser({ userId: player1Id, name: 'Player 1' })

    const player2Id = await signInAsUser(player2)
    await db.createUser({ userId: player2Id, name: 'Player 2' })

    await db.addFriend(player2Id, hostId)
    await db.addFriend(player2Id, player1Id)

    const friends = await db.getFriends(player2Id)
    expect(friends.length).toBe(2)
    expect(friends).toEqual(expect.arrayContaining([
      {
        userId: hostId,
        name: 'Host'
      },
      {
        userId: player1Id,
        name: 'Player 1'
      }
    ]))
  })

  test('should remove friend', async () => {
    const hostId = await signInAsUser(host)
    await db.createUser({ userId: hostId, name: 'Host' })

    const player1Id = await signInAsUser(player1)
    await db.createUser({ userId: player1Id, name: 'Player 1' })

    const player2Id = await signInAsUser(player2)
    await db.createUser({ userId: player2Id, name: 'Player 2' })

    await db.addFriend(player2Id, hostId)
    await db.addFriend(player2Id, player1Id)
    await db.removeFriend(player2Id, hostId)

    const friends = await db.getFriends(player2Id)
    expect(friends).toEqual([
      {
        userId: player1Id,
        name: 'Player 1'
      }
    ]) 
  })

  test('should create game', async () => {
    const hostId = await signInAsUser(host)
    await db.createUser({ userId: hostId, name: 'Host' })
    
    const timestamp = firebase.firestore.Timestamp.now()
    const game: Game = await createGame(hostId, timestamp)

    const { gameId } = await db.createGame(game)
    
    await signInAsAdmin()

    const gameSnapshot = await firestore.collection('users').doc(hostId).collection('games').doc(gameId).get()
    expect(gameSnapshot.exists).toBe(true)
    expect(gameSnapshot.data()).toEqual({
      hostId: hostId,
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
    const hostId = await signInAsUser(host)
    await db.createUser({ userId: hostId, name: 'Host' })

    const timestampBefore = firebase.firestore.Timestamp.now()
    
    const game = await createGame(hostId, timestampBefore) 

    const timestampAfter = firebase.firestore.Timestamp.now()
    const updatedGame = set('timestamp', timestampAfter, game)
    
    await db.updateGame(updatedGame)

    await signInAsAdmin()

    const gameSnapshot = await firestore.collection('users').doc(hostId).collection('games').doc(game.gameId).get()
    expect(gameSnapshot.exists).toBe(true)
    expect(gameSnapshot.data()).toEqual({
      hostId: hostId,
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
    const player1Id = await signInAsUser(player1)
    await db.createUser({ userId: player1Id, name: 'Player 1' })

    const hostId = await signInAsUser(host)
    await db.createUser({ userId: hostId, name: 'Host' })

    await db.addFriend(hostId, player1Id)

    const game = await createGame(hostId, firebase.firestore.Timestamp.now())

    const invitation: Invitation = {
      hostId: hostId,
      gameId: game.gameId
    }

    await db.inviteToGame(player1Id, invitation)

    await signInAsAdmin()

    const snapshot = await firestore.collection('users').doc(hostId).collection('games').doc(game.gameId).collection('invitations').doc(player1Id).get()
    expect(snapshot.exists).toBe(true)
    
    const querySnapshot = await firestore.collection('users').doc(player1Id).collection('invitations').get()
    expect(querySnapshot.docs.length).toBe(1)
    expect(querySnapshot.docs[0].data()).toEqual(invitation) 
  }) 

  test('shoud accept invitation', async () => {
    const player1Id = await signInAsUser(player1)
    await db.createUser({ userId: player1Id, name: 'Player 1' })

    const hostId = await signInAsUser(host)
    await db.createUser({ userId: hostId, name: 'Host' })

    await db.addFriend(hostId, player1Id)

    const game = await createGame(hostId, firebase.firestore.Timestamp.now())

    const invitation: Invitation = {
      hostId: hostId,
      gameId: game.gameId
    }

    await db.inviteToGame(player1Id, invitation)

    await signInAsUser(player1)

    const timestamp = firebase.firestore.Timestamp.now()

    const invitationResponse: InvitationResponse = {
      gameId: game.gameId,
      hostId: hostId,
      playerId: player1Id,
      timestamp,
      status: 'approved',
      valid: true
    }

    await db.respondToGameInvitation(invitationResponse)

    await signInAsAdmin()

    const snapshot = await firestore.collection('users').doc(hostId).collection('games').doc(game.gameId).collection('responses').get()
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
    const player1Id = await signInAsUser(player1)
    await db.createUser({ userId: player1Id, name: 'Player 1' })

    const hostId = await signInAsUser(host)
    await db.createUser({ userId: hostId, name: 'Host' })

    const timestampBefore = firebase.firestore.Timestamp.now()
    const game = await createGame(hostId, timestampBefore)

    await db.inviteToGame(player1Id, {
      gameId: game.gameId,
      hostId: hostId
    })

    await signInAsUser(player1)

    await db.respondToGameInvitation({
      gameId: game.gameId,
      hostId: hostId,
      playerId: player1Id,
      status: 'approved',
      timestamp: firebase.firestore.Timestamp.now(),
      valid: true
    })

    await signInAsUser(host)

    const timestampAfter = firebase.firestore.Timestamp.now()
    const updatedGame = set('timestamp', timestampAfter, game)

    await db.updateGame(updatedGame)
    await db.invalidateResponses(hostId, game.gameId)

    await signInAsAdmin()

    const gameSnapshot = await firestore.collection('users').doc(hostId).collection('games').doc(game.gameId).get()
    expect(gameSnapshot.exists).toBe(true) 
    expect(gameSnapshot.data()!.timestamp).toEqual(timestampAfter)
    
    const invalidResponse = await firestore.collection('users').doc(hostId).collection('games').doc(game.gameId).collection('responses').doc(player1Id).get()
    expect(invalidResponse.get('valid')).toEqual(false) 

    await signInAsUser(player1)
    await db.validateResponse(player1Id, hostId, game.gameId)

    await signInAsAdmin()

    const validResponse = await firestore.collection('users').doc(hostId).collection('games').doc(game.gameId).collection('responses').doc(player1Id).get()
    expect(validResponse.get('valid')).toEqual(true) 
  })

  test('listen to games', async () => {      
    const playerId = await signInAsUser(player1)
    await db.createUser({ userId: playerId, name: 'Player 1' })
    const playerGame = await createGame(playerId, firebase.firestore.Timestamp.now())

    const hostId = await signInAsUser(host)
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
    const playerId = await signInAsUser(player1)
    await db.createUser({ userId: playerId, name: 'Player 1' })

    const hostId = await signInAsUser(host)
    await db.createUser({ userId: hostId, name: 'Host' })

    const game = await createGame(hostId, firebase.firestore.Timestamp.now())
    await db.inviteToGame(playerId, { hostId, gameId: game.gameId })
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