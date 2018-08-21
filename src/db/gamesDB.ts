import * as firebase from 'firebase/app'
import { Game, InvitationStatus, Time, User, Address, Invitation, InvitationResponse } from '../model/types'
import { map, concat, join, noop, assign } from 'lodash/fp'
import { GamesDB as GamesDatabase, Unsubscribe, GameEvent, GamesEvent } from './types'

type Firestore = firebase.firestore.Firestore
const Timestamp = firebase.firestore.Timestamp

export interface GamesEvent {
  (games: ReadonlyArray<Game>): void
}

export interface GamesDB {
  addGame(game: Game): Promise<string>
  inviteToGame(gameId: string, playerId: string): Promise<void>
  respondToGameInvitation(hostId: string, gameId: string, status: InvitationStatus, arriveTime: Time): Promise<void>
  listenToGames(onGames: GamesEvent): void 
  unlistenToGames(): void
}

const path = (...names: string[]) => join('/', names)

export const GamesDB: (db: Firestore, userId: string) => GamesDatabase = (db, userId) => {

  const collection = (...names: string[]) => db.collection(path(...names))

  const createUser: (user: User) => Promise<string> = async user => {
    const userIdDocRef = await db.collection('users').add(user)
    return userIdDocRef.id
  }

  const getUser: (userId: string) => Promise<User | undefined> = async userId => {
    const userSnapshot = await db.collection('users').doc(userId).get()
    const userData = userSnapshot.data()
    return userData ? userData as User : undefined
  }

  const createAddress: (userId: string, address: Address) => Promise <void> = async (userId, address) => {
    db.collection('users').doc(userId).collection('addresses').add(address)
  }

  const getAddresses: (userId: string) => Promise<ReadonlyArray<Address>> = async userId => {
    const addressesSnapshot = await db.collection('users').doc(userId).collection('addresses').get()
    return map(snapshot => snapshot.data()! as Address, addressesSnapshot.docs)
  }

  const createFriendInvitation: (userId: string) => Promise<string> = async userId => {
    const invitationRef = await db.collection('users').doc(userId).collection('friendInvitations').add({})
    return invitationRef.id
  }

  const acceptFriendInvitation: (userId: string, invitationId: string, friendUserId: string) => Promise<void> = async (userId, invitationId, friendUserId) => {
    return db.runTransaction(async tx => {
      tx.set(db.collection('users').doc(friendUserId).collection('friends').doc(userId), {})
      tx.delete(db.collection('users').doc(friendUserId).collection('friendInvitations').doc(invitationId))
      tx.set(db.collection('users').doc(userId).collection('friends').doc(friendUserId), {})
    })
  }

  const addFriend: (userId: string, friendUserId: string) => Promise<void> = async (userId, friendUserId) => {
    db.collection('users').doc(friendUserId).collection('friends').doc(userId).set({})
  } 
  
  const removeFriend: (userId: string, friendUserId: string) => Promise<void> = async (userId, friendUserId) => {
    db.collection('users').doc(friendUserId).collection('friends').doc(userId).delete()
  }

  const createGame: (game: Game) => Promise<Game> = async game => {
    const ref = await db.collection('users').doc(game.hostId).collection('games').add(game)
    return assign(game, { 'gameId' : ref.id })
  }

  const inviteToGame: (invitation: Invitation) => Promise<void> = async ({ gameId, hostId, playerId }) => 
    db.runTransaction(async tx => {
      tx.set(collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(playerId), {})
      tx.set(collection('users').doc(playerId).collection('invitations').doc(), { hostId, gameId })
    })

  const respondToGameInvitation: (response: InvitationResponse) => Promise<void> = 
    async ({gameId, hostId, notes, playerId, status, timestamp}) => 
      db.collection('users').doc(hostId).collection('games').doc(gameId).collection('responses').doc(playerId).set({status, timestamp, notes})

  const listenToGames: (userId: string, onGames: GamesEvent) => Unsubscribe = (userId, onGames) => {

    let ownGames: Game[] = []
    let invitationGames: Game[] = []
    let unsubscribe: Unsubscribe = noop

    const notify = () => {
      onGames(concat(ownGames, invitationGames))
    }

    const listen = async () => {
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      
      const snapshot = await collection('users').doc(userId).collection('games')
        .where('timestamp', '>=', Timestamp.fromDate(midnight))
        .orderBy('timestamp', 'asc')
        .get()
      
      ownGames = map(doc => doc.data() as Game, snapshot.docs)

      unsubscribe = db.collection('users').doc(userId).collection('invitations').onSnapshot(async snapshot => {
        const invitations: Invitation[] = 
          map(snapshot => ({
            hostId: snapshot.data().hostId,
            gameId: snapshot.id,
            playerId: userId
          }), snapshot.docs)

        const gameSnapshots = await Promise.all(map(({hostId, gameId}) => db.collection('users').doc(hostId).collection('games').doc(gameId).get(), invitations))
        invitationGames = map(snapshot => snapshot.data() as Game, gameSnapshots)
        notify()
      })
    }

    listen()

    return () => {
      unsubscribe()
    }
  }
  
  const listenToGame: (userId: string, gameId: string, onGame: GameEvent) => Unsubscribe = (userId, gameId, onGame) => {
    let game: Game | undefined = undefined
    let invitations: Invitation[] | undefined = undefined
    let responses: InvitationResponse[] | undefined = undefined

    const notify = () => {
      if (game && invitations && responses) {
        onGame(game, invitations, responses)
      }
    }

    const unsubscribeGame = db.collection('users').doc('userId').collection('games').doc(gameId).onSnapshot(snapshot => {
      game = snapshot.data()! as Game
      notify()
    })

    const unsubscribeInvitations = db.collection('users').doc('userId').collection('games').doc(gameId).collection('invitations').onSnapshot(querySnapshot => {
      invitations = map(({ id }) => ({ hostId: userId, gameId, playerId: id }), querySnapshot.docs)
      notify()
    })

    const unsubscribeResponses = db.collection('users').doc('userId').collection('games').doc(gameId).collection('responses').onSnapshot(querySnapshot => {
      responses = map(docSnapshot => docSnapshot.data() as InvitationResponse, querySnapshot.docs)
      notify()
    })
    
    return () => {
      unsubscribeGame()
      unsubscribeInvitations()
      unsubscribeResponses()
    }
  }

  return {
    createUser,
    getUser,

    createAddress,
    getAddresses,

    createFriendInvitation,
    acceptFriendInvitation,

    addFriend,
    removeFriend,

    createGame,
    inviteToGame,
    respondToGameInvitation,
    listenToGames,
    listenToGame
  }
}