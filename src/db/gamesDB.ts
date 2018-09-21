import * as firebase from 'firebase/app'
import { Game, User, Address, Invitation, InvitationResponse } from './types'
import { map, assign, omit, forEach } from 'lodash/fp'

type Firestore = firebase.firestore.Firestore

const USERS = 'users'
const FRIENDS = 'friends'
const FRIEND_INVITATIONS = 'friendInvitations'
const ADDRESSES = 'addresses'
const GAMES = 'games'
const INVITATIONS = 'invitations'
const RESPONSES = 'responses'

type DataEvent<T> = (data: T) => void 

export type GamesEvent = DataEvent<ReadonlyArray<Game>>
export type GameEvent = DataEvent<Game | undefined>
export type AddressesEvent = DataEvent<ReadonlyArray<Address>>
export type UsersEvent = DataEvent<ReadonlyArray<User>>
export type InvitationsEvent = DataEvent<ReadonlyArray<Invitation>>
export type ResponsesEvent = DataEvent<ReadonlyArray<InvitationResponse>>

export type Unsubscribe = () => void

export interface GamesDatabase {
  createUser(user: User): Promise<void>
  getUser(userId: string): Promise<User | undefined>

  createAddress(userId: string, address: Address): Promise<void>
  updateAddress(userId: string, address: Address): Promise<void>
  removeAddress(userId: string, addressId: string): Promise<void>
  getAddresses(userId: string): Promise<ReadonlyArray<Address>>

  createFriendInvitation(userId: string): Promise<string>
  acceptFriendInvitation(userId: string, invitationId: string, friendUserId: string): Promise<void>

  addFriend(userId: string, friendUserId: string): Promise<void>
  removeFriend(userId: string, friendUserId: string): Promise<void>
  getFriendIds(userId: string): Promise<ReadonlyArray<string>>

  createGame(game: Game): Promise<Game>
  updateGame(game: Game): Promise<void>

  invalidateResponses(userId: string, gameId: string): Promise<void>
  validateResponse(userId: string, hostId: string, gameId: string): Promise<void>

  inviteToGame(playerId: string, invitation: Invitation): Promise<void>
  respondToGameInvitation(response: InvitationResponse): Promise<void>

  getOwnGames(userId: string): Promise<ReadonlyArray<Game>>
  getGame(userId: string, gameId: string): Promise<Game | undefined>
  getIncomingInvitations(userId: string): Promise<ReadonlyArray<Invitation>>
  getGameInvitedPlayerIds(userId: string, gameId: string): Promise<ReadonlyArray<string>>
  getGameInvitationResponse(userId: string, gameId: string): Promise<ReadonlyArray<InvitationResponse>>
}

export const GamesDatabase = (db: Firestore): GamesDatabase => {
  const createUser: (user: User) => Promise<void> = async user => {
    await db
      .collection(USERS)
      .doc(user.userId)
      .set(omit(['userId'], user))
  }

  const getUser = async (userId: string): Promise<User | undefined> => {
    const userSnapshot = await db
      .collection(USERS)
      .doc(userId)
      .get()
    return userSnapshot.exists ? (assign({ userId: userSnapshot.id }, userSnapshot.data()!) as User) : undefined
  }

  const createAddress = async (userId: string, address: Address): Promise<void> => {
    await db
      .collection(USERS)
      .doc(userId)
      .collection(ADDRESSES)
      .add(omit(['addressId'], address))
  }

  const getAddresses = async (userId: string): Promise<ReadonlyArray<Address>> => {
    const querySnapshot = await db.collection(USERS).doc(userId).collection(ADDRESSES).get()
    const addresses = map(snapshot => assign({ addressId: snapshot.id }, snapshot.data()) as Address, querySnapshot.docs)
    return addresses
  }

  const updateAddress = async (userId: string, address: Address): Promise<void> =>
    db
      .collection(USERS)
      .doc(userId)
      .collection(ADDRESSES)
      .doc(address.addressId)
      .set(omit(['addressId'], address))

  const removeAddress = async (userId: string, addressId: string): Promise<void> =>
    db
      .collection(USERS)
      .doc(userId)
      .collection(ADDRESSES)
      .doc(addressId)
      .delete()

  const createFriendInvitation = async (userId: string): Promise<string> => {
    const snapshot = await db
      .collection(USERS)
      .doc(userId)
      .collection(FRIEND_INVITATIONS)
      .add({})
    return snapshot.id
  }

  const acceptFriendInvitation = async (userId: string, invitationId: string, friendUserId: string): Promise<void> =>
    db
      .batch()
      .set(
        db
          .collection(USERS)
          .doc(friendUserId)
          .collection(FRIENDS)
          .doc(userId),
        { invitationId }
      )
      .set(
        db
          .collection(USERS)
          .doc(userId)
          .collection(FRIENDS)
          .doc(friendUserId),
        {}
      )
      .delete(
        db
          .collection(USERS)
          .doc(friendUserId)
          .collection(FRIEND_INVITATIONS)
          .doc(invitationId)
      )
      .commit()

  const addFriend = async (userId: string, friendUserId: string): Promise<void> =>
    db
      .collection(USERS)
      .doc(userId)
      .collection(FRIENDS)
      .doc(friendUserId)
      .set({})

  const removeFriend = async (userId: string, friendUserId: string): Promise<void> =>
    db
      .collection(USERS)
      .doc(userId)
      .collection(FRIENDS)
      .doc(friendUserId)
      .delete()

  const getFriendIds = async (userId: string): Promise<ReadonlyArray<string>> => {
    const querySnapshot = await db.collection(USERS).doc(userId).collection(FRIENDS).get() 
    const userIds = map(snapshot => snapshot.id, querySnapshot.docs)
    return userIds
  }

  const createGame = async (game: Game): Promise<Game> => {
    const ref = await db
      .collection(USERS)
      .doc(game.hostId)
      .collection(GAMES)
      .add(omit(['gameId'], game))
    return assign(game, { gameId: ref.id })
  }

  const updateGame = async (game: Game): Promise<void> =>
    db
      .collection(USERS)
      .doc(game.hostId)
      .collection(GAMES)
      .doc(game.gameId)
      .set(omit(['gameId'], game))

  const inviteToGame = async (playerId: string, invitation: Invitation): Promise<void> =>
    db
      .batch()
      .set(
        db
          .collection(USERS)
          .doc(invitation.hostId)
          .collection(GAMES)
          .doc(invitation.gameId)
          .collection(INVITATIONS)
          .doc(playerId),
        {}
      )
      .set(
        db
          .collection(USERS)
          .doc(playerId)
          .collection(INVITATIONS)
          .doc(),
        invitation
      )
      .commit()

  const respondToGameInvitation = async (response: InvitationResponse): Promise<void> => {
    const { gameId, hostId, notes, playerId, status, timestamp } = response
    const ref = db
      .collection(USERS)
      .doc(hostId)
      .collection(GAMES)
      .doc(gameId)
      .collection(RESPONSES)
      .doc(playerId)
    if (notes) {
      await ref.set({ status, timestamp, notes, valid: true })
    } else {
      await ref.set({ status, timestamp, valid: true })
    }
  }

  const invalidateResponses = async (userId: string, gameId: string): Promise<void> => {
    const responsesSnapshot = await db
      .collection(USERS)
      .doc(userId)
      .collection(GAMES)
      .doc(gameId)
      .collection(RESPONSES)
      .get()
    const batch = db.batch()
    forEach(snapshot => batch.update(snapshot.ref, { valid: false }), responsesSnapshot.docs)
    await batch.commit()
  }

  const validateResponse = async (userId: string, hostId: string, gameId: string): Promise<void> =>
    db
      .collection(USERS)
      .doc(hostId)
      .collection(GAMES)
      .doc(gameId)
      .collection(RESPONSES)
      .doc(userId)
      .update({ valid: true })

  const getOwnGames = async (userId: string): Promise<ReadonlyArray<Game>> => {
    const querySnapshot = await db.collection(USERS).doc(userId).collection(GAMES).get()
    const games = map(snapshot => assign({ gameId: snapshot.id }, snapshot.data()) as Game, querySnapshot.docs)
    return games
  }
  
  const getGame = async (userId: string, gameId: string): Promise<Game | undefined> => {
    const documentSnapshot = await db.collection(USERS).doc(userId).collection(GAMES).doc(gameId).get()
    const data = documentSnapshot.data()
    if (data) {
      return assign({ gameId: documentSnapshot.id }, data) as Game
    }
    return undefined
  }

  const getIncomingInvitations = async (userId: string): Promise<ReadonlyArray<Invitation>> => {
    const querySnapshot = await db.collection(USERS).doc(userId).collection(INVITATIONS).get()
    const invitations = map(snapshot => snapshot.data() as Invitation, querySnapshot.docs)
    return invitations
  }

  const getGameInvitedPlayerIds = async (userId: string, gameId: string): Promise<ReadonlyArray<string>> => {
    const querySnapshot = await db.collection(USERS).doc(userId).collection(GAMES).doc(gameId).collection(INVITATIONS).get()
    const userIds = map(snapshot => snapshot.id, querySnapshot.docs)
    return userIds
  }

  const getGameInvitationResponse = async (userId: string, gameId: string): Promise<ReadonlyArray<InvitationResponse>> => {
    const querySnapshot = await db.collection(USERS).doc(userId).collection(GAMES).doc(gameId).collection(RESPONSES).get()
    const responses = map(snapshot => assign({hostId: userId, gameId, playerId: snapshot.id}, snapshot.data()) as InvitationResponse, querySnapshot.docs)
    return responses
  }


  return {
    createUser,
    getUser,

    createAddress,
    updateAddress,
    removeAddress,
    getAddresses,

    createFriendInvitation,
    acceptFriendInvitation,

    addFriend,
    removeFriend,
    getFriendIds,

    createGame,
    updateGame,

    invalidateResponses,
    validateResponse,

    inviteToGame,
    respondToGameInvitation,
    
    getOwnGames,
    getGame,
    getIncomingInvitations,
    getGameInvitedPlayerIds,
    getGameInvitationResponse
  }
}
