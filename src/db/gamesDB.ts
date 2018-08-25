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

export const GamesDB = (db: Firestore): GamesDatabase => {
  const createUser: (user: User) => Promise<void> = async user => {
    await db.collection(USERS).doc(user.userId).set(omit(['userId'], user))
  }

  const getUser = async (userId: string): Promise<User | undefined> => {
    const userSnapshot = await db.collection(USERS).doc(userId).get()
    return userSnapshot.exists 
      ? assign({ userId: userSnapshot.id }, userSnapshot.data()!) as User
      : undefined
  }

  const createAddress = async (userId: string, address: Address): Promise<void> => {
    await db.collection(USERS).doc(userId).collection(ADDRESSES).add(omit(['addressId'], address))
  }

  const getAddresses = async (userId: string): Promise<ReadonlyArray<Address>> => {
    const addressesSnapshot = await db.collection(USERS).doc(userId).collection(ADDRESSES).get()
    return map(snapshot => assign({addressId: snapshot.id}, snapshot.data()) as Address, addressesSnapshot.docs)
  }

  const updateAddress = async (userId: string, address: Address): Promise<void> => 
    db.collection(USERS).doc(userId).collection(ADDRESSES).doc(address.addressId).set(omit(['addressId'], address))
  
  
  const removeAddress = async (userId: string, addressId: string): Promise<void> => 
    db.collection(USERS).doc(userId).collection(ADDRESSES).doc(addressId).delete()
  

  const createFriendInvitation = async (userId: string): Promise<string> => {
    const snapshot = await db.collection(USERS).doc(userId).collection(FRIEND_INVITATIONS).add({})
    return snapshot.id
  }

  const acceptFriendInvitation = async (userId: string, invitationId: string, friendUserId: string): Promise<void> => 
    db.batch()
      .set(db.collection(USERS).doc(friendUserId).collection(FRIENDS).doc(userId), {invitationId})
      .set(db.collection(USERS).doc(userId).collection(FRIENDS).doc(friendUserId), {})
      .delete(db.collection(USERS).doc(friendUserId).collection(FRIEND_INVITATIONS).doc(invitationId))
      .commit()
  
  const addFriend = async (userId: string, friendUserId: string): Promise<void> => 
    db.collection(USERS).doc(userId).collection(FRIENDS).doc(friendUserId).set({})
   
  
  const removeFriend = async (userId: string, friendUserId: string): Promise<void> => 
    db.collection(USERS).doc(userId).collection(FRIENDS).doc(friendUserId).delete()

  const getFriends = async (userId: string): Promise<User[]> => {
    const snapshot = await db.collection(USERS).doc(userId).collection(FRIENDS).get()
    const userIds = map(snapshot => snapshot.id, snapshot.docs)
    const users = await Promise.all(map(getUser, userIds))
    return compact(users)
  }

  const createGame = async (game: Game): Promise<Game> => {
    const ref = await db.collection(USERS).doc(game.hostId).collection(GAMES).add(omit(['gameId'], game))
    return assign(game, { 'gameId' : ref.id })
  }

  const updateGame = async (game: Game): Promise<void> => 
    db.collection(USERS).doc(game.hostId).collection(GAMES).doc(game.gameId).set(omit(['gameId'], game))

  const inviteToGame = async (playerId: string, invitation: Invitation): Promise<void> => 
    db.batch()
      .set(db.collection(USERS).doc(invitation.hostId).collection(GAMES).doc(invitation.gameId).collection(INVITATIONS).doc(playerId), {})
      .set(db.collection(USERS).doc(playerId).collection(INVITATIONS).doc(), invitation)
      .commit()

  const respondToGameInvitation = async (response: InvitationResponse): Promise<void> => {
      const { gameId, hostId, notes, playerId, status, timestamp } = response
      const ref = db.collection(USERS).doc(hostId).collection(GAMES).doc(gameId).collection(RESPONSES).doc(playerId)
      if (notes) {
        await ref.set({status, timestamp, notes, valid: true})
      }
      else { 
        await ref.set({ status, timestamp, valid: true })
      }
    }

  const invalidateResponses = async (userId: string, gameId: string): Promise<void> => {
    const responsesSnapshot = await db.collection(USERS).doc(userId).collection(GAMES).doc(gameId).collection(RESPONSES).get()
    const batch = db.batch()
    forEach(snapshot => batch.update(snapshot.ref, { valid: false }), responsesSnapshot.docs)
    await batch.commit()
  }

  const validateResponse = async (userId: string, gameId: string, playerId: string): Promise<void> => {

  }

  const listenToGames = (userId: string, onGames: GamesEvent): Unsubscribe => {
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
  
  const listenToGame = (userId: string, gameId: string, onGame: GameEvent): Unsubscribe => {
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
    updateAddress,
    removeAddress,

    createFriendInvitation,
    acceptFriendInvitation,

    addFriend,
    removeFriend,
    getFriends,

    createGame,
    updateGame,

    invalidateResponses,
    validateResponse,

    inviteToGame,
    respondToGameInvitation,
    listenToGames,
    listenToGame
  }
}