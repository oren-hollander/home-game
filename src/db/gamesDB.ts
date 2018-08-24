import * as firebase from 'firebase/app'
import { Game, User, Address, Invitation, InvitationResponse } from '../model/types'
import { map, concat, compact, noop, assign, omit, forEach } from 'lodash/fp'
import { GamesDatabase, Unsubscribe, GameEvent, GamesEvent } from './types'

type Firestore = firebase.firestore.Firestore

const USERS = 'users'
const FRIENDS = 'friends'
const FRIEND_INVITATIONS = 'friendInvitations'
const ADDRESSES = 'addresses'
const GAMES = 'games'
const INVITATIONS = 'invitations'
const RESPONSES = 'responses'

export interface GamesEvent {
  (games: ReadonlyArray<Game>): void
}

export const GamesDB: (db: Firestore) => GamesDatabase = (db) => {
  const createUser: (user: User) => Promise<void> = async user => {
    await db.collection(USERS).doc(user.userId).set(omit(['userId'], user))
  }

  const getUser: (userId: string) => Promise<User | undefined> = async userId => {
    const userSnapshot = await db.collection(USERS).doc(userId).get()
    return userSnapshot.exists 
      ? assign({ userId: userSnapshot.id }, userSnapshot.data()!) as User
      : undefined
  }

  const createAddress: (userId: string, address: Address) => Promise<void> = async (userId, address) => {
    db.collection(USERS).doc(userId).collection(ADDRESSES).add(address)
  }

  const getAddresses: (userId: string) => Promise<ReadonlyArray<Address>> = async userId => {
    const addressesSnapshot = await db.collection(USERS).doc(userId).collection(ADDRESSES).get()
    return map(snapshot => snapshot.data() as Address, addressesSnapshot.docs)
  }

  const createFriendInvitation: (userId: string) => Promise<string> = async userId => {
    const snapshot = await db.collection(USERS).doc(userId).collection(FRIEND_INVITATIONS).add({})
    return snapshot.id
  }

  const acceptFriendInvitation: (userId: string, invitationId: string, friendUserId: string) => Promise<void> = async (userId, invitationId, friendUserId) => 
    db.batch()
      .set(db.collection(USERS).doc(friendUserId).collection(FRIENDS).doc(userId), {invitationId})
      .set(db.collection(USERS).doc(userId).collection(FRIENDS).doc(friendUserId), {})
      .delete(db.collection(USERS).doc(friendUserId).collection(FRIEND_INVITATIONS).doc(invitationId))
      .commit()
  
  const addFriend: (userId: string, friendUserId: string) => Promise<void> = async (userId, friendUserId) => {
    db.collection(USERS).doc(userId).collection(FRIENDS).doc(friendUserId).set({})
  } 
  
  const removeFriend: (userId: string, friendUserId: string) => Promise<void> = async (userId, friendUserId) => {
    db.collection(USERS).doc(userId).collection(FRIENDS).doc(friendUserId).delete()
  }

  const getFriends: (userId: string) => Promise<User[]> = async userId => {
    const snapshot = await db.collection(USERS).doc(userId).collection(FRIENDS).get()
    const userIds = map(snapshot => snapshot.id, snapshot.docs)
    const users = await Promise.all(map(getUser, userIds))
    return compact(users)
  }

  const createGame: (game: Game) => Promise<Game> = async game => {
    const ref = await db.collection(USERS).doc(game.hostId).collection(GAMES).add(omit(['gameId'], game))
    return assign(game, { 'gameId' : ref.id })
  }

  const updateGame: (game: Game, validateInvitations: boolean) => Promise<void> = async (game, validateInvitations) => {
    const gameRef = db.collection(USERS).doc(game.hostId).collection(GAMES).doc(game.gameId)
    await gameRef.set(omit(['gameId'], game))
    if(validateInvitations){
      const batch = db.batch()
      const responsesSnapshot = await gameRef.collection(RESPONSES).get()
      forEach(snapshot => {
        batch.update(snapshot.ref, {valid: false})
      }, responsesSnapshot.docs)
      await batch.commit()
    }
  }

  const inviteToGame: (playerId: string, invitation: Invitation) => Promise<void> = async (playerId, invitation) => 
    db.batch()
      .set(db.collection(USERS).doc(invitation.hostId).collection(GAMES).doc(invitation.gameId).collection(INVITATIONS).doc(playerId), {})
      .set(db.collection(USERS).doc(playerId).collection(INVITATIONS).doc(), invitation)
      .commit()

  const respondToGameInvitation: (response: InvitationResponse) => Promise<void> = 
    async ({gameId, hostId, notes, playerId, status, timestamp}) => 
      db.collection(USERS).doc(hostId).collection(GAMES).doc(gameId).collection(RESPONSES).doc(playerId).set({status, timestamp, notes, valid: true})

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
      
      const snapshot = await db.collection(USERS).doc(userId).collection(GAMES)
        .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(midnight))
        .orderBy('timestamp', 'asc')
        .get()
      
      ownGames = map(doc => doc.data() as Game, snapshot.docs)

      unsubscribe = db.collection(USERS).doc(userId).collection(INVITATIONS).onSnapshot(async snapshot => {
        const invitations: Invitation[] = 
          map(snapshot => ({
            hostId: snapshot.data().hostId,
            gameId: snapshot.id,
            playerId: userId
          }), snapshot.docs)

        const gameSnapshots = await Promise.all(map(({hostId, gameId}) => db.collection(USERS).doc(hostId).collection(GAMES).doc(gameId).get(), invitations))
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

    const unsubscribeGame = db.collection(USERS).doc('userId').collection(GAMES).doc(gameId).onSnapshot(snapshot => {
      game = snapshot.data()! as Game
      notify()
    })

    const unsubscribeInvitations = db.collection(USERS).doc('userId').collection(GAMES).doc(gameId).collection(INVITATIONS).onSnapshot(querySnapshot => {
      invitations = map(({ id }) => ({ hostId: userId, gameId, playerId: id }), querySnapshot.docs)
      notify()
    })

    const unsubscribeResponses = db.collection(USERS).doc('userId').collection(GAMES).doc(gameId).collection(RESPONSES).onSnapshot(querySnapshot => {
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