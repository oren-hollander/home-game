import * as firebase from 'firebase/app'
import { Game, InvitationStatus, Time, User, Address, Invitation, InvitationResponse } from '../model/types'
import { map, concat, compact, noop, assign, omit, forEach } from 'lodash/fp'
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

export const GamesDB: (db: Firestore, userId: string) => GamesDatabase = (db, userId) => {
  const createUser: (user: User) => Promise<void> = async user => {
    db.collection('users').doc(userId).set(omit(['userId'], user))
  }

  const getUser: (userId: string) => Promise<User | undefined> = async userId => {
    const userSnapshot = await db.collection('users').doc(userId).get()
    return userSnapshot.exists 
      ? assign({}, userSnapshot.data()! as User)
      : undefined
  }

  const createAddress: (userId: string, address: Address) => Promise<void> = async (userId, address) => {
    db.collection('users').doc(userId).collection('addresses').add(address)
  }

  const getAddresses: (userId: string) => Promise<ReadonlyArray<Address>> = async userId => {
    const addressesSnapshot = await db.collection('users').doc(userId).collection('addresses').get()
    return map(snapshot => snapshot.data() as Address, addressesSnapshot.docs)
  }

  const createFriendInvitation: (userId: string) => Promise<string> = async userId => {
    const snapshot = await db.collection('users').doc(userId).collection('friendInvitaions').add({})
    return snapshot.id
  }

  const acceptFriendInvitation: (userId: string, invitationId: string, friendUserId: string) => Promise<void> = async (userId, invitationId, friendUserId) => {
    return db.runTransaction(async tx => {
      tx.delete(db.collection('users').doc(friendUserId).collection('friendInvitations').doc(invitationId))
      tx.set(db.collection('users').doc(friendUserId).collection('friends').doc(userId), {})
      tx.set(db.collection('users').doc(userId).collection('friends').doc(friendUserId), {})
    })
  }

  const addFriend: (userId: string, friendUserId: string) => Promise<void> = async (userId, friendUserId) => {
    db.collection('users').doc(userId).collection('friends').doc(friendUserId).set({})
  } 
  
  const removeFriend: (userId: string, friendUserId: string) => Promise<void> = async (userId, friendUserId) => {
    db.collection('users').doc(userId).collection('friends').doc(friendUserId).delete()
  }

  const getFriends: (userId: string) => Promise<User[]> = async userId => {
    const snapshot = await db.collection('users').doc(userId).collection('friends').get()
    const userIds = map(snapshot => snapshot.id, snapshot.docs)
    const users = await Promise.all(map(getUser, userIds))
    return compact(users)
  }

  const createGame: (game: Game) => Promise<Game> = async game => {
    const ref = await db.collection('users').doc(game.hostId).collection('games').add(omit(['gameId'], game))
    return assign(game, { 'gameId' : ref.id })
  }

  const updateGame: (game: Game, validateInvitations: boolean) => Promise<void> = async (game, validateInvitations) => {
    const gameRef = db.collection('users').doc(game.hostId).collection('games').doc(game.gameId)
    await gameRef.set(game)
    if(validateInvitations){
      const batch = db.batch()
      const responsesSnapshot = await gameRef.collection('responses').get()
      forEach(snapshot => {
        batch.update(snapshot.ref, {valid: false})
      }, responsesSnapshot.docs)
      await batch.commit()
    }
  }

  const inviteToGame: (playerId: string, invitation: Invitation) => Promise<void> = async (playerId, invitation) => 
    db.runTransaction(async tx => {
      tx.set(db.collection('users').doc(invitation.hostId).collection('games').doc(invitation.gameId).collection('invitations').doc(playerId), {})
      tx.set(db.collection('users').doc(playerId).collection('invitations').doc(), invitation)
    })

  const respondToGameInvitation: (response: InvitationResponse) => Promise<void> = 
    async ({gameId, hostId, notes, playerId, status, timestamp}) => 
      db.collection('users').doc(hostId).collection('games').doc(gameId).collection('responses').doc(playerId).set({status, timestamp, notes, valid: true})

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
      
      const snapshot = await db.collection('users').doc(userId).collection('games')
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
    getFriends,

    createGame,
    updateGame,

    inviteToGame,
    respondToGameInvitation,
    listenToGames,
    listenToGame
  }
}