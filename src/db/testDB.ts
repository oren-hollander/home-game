import { Game, InvitationStatus, User, Address, Invitation, InvitationResponse } from '../model/types'
import { GamesDB, GamesEvent, GameEvent } from './types'
import { map, uniqueId, concat } from 'lodash/fp'
import * as firebase from 'firebase/app'
import { MemDB } from './memDB'

const Timestamp = firebase.firestore.Timestamp

export const GamesTestDB: () => GamesDB = () => {

  const db = MemDB()

  const createUser = async (name: string, email: string) => {
    const userId = uniqueId('user-')

    const user: User = {
      userId,
      name,
      email
    }

    db.collection('users').doc('user').set(user)
    return userId
  }
  
  const getUser = async (userId: string) => {
    const user = (await db.collection('users').doc(userId).get())! as User
    return user
  }

  const createAddress = async (userId: string, address: Address) => {
    db.collection('users').doc(userId).collection('addresses').doc(address.addressId).set(address)
  }
  
  const getAddresses = async (userId: string) => {
    const docs = await db.collection('users').doc(userId).collection('addresses').get() 
    return docs as Address[] 
  } 

  const connectFriend = async (userId: string, friendUserId: string) => {
    db.collection('users').doc(userId).collection('friends').doc(friendUserId).set({})
    db.collection('users').doc(friendUserId).collection('friends').doc(userId).set({})
  }

  const addFriend = async (userId: string, friendUserId: string) => {
    db.collection('users').doc(userId).collection('friends').doc(friendUserId).set({})
  }

  const removeFriend = async (userId: string, friendUserId: string) => {
    db.collection('users').doc(userId).collection('friends').doc(friendUserId).delete()
  }

  const createGame = async (game: Game) => {
    const gameId = uniqueId('game-')
    db.collection('users').doc(game.hostId).collection('games').doc(gameId).set(game)
    return gameId
  }

  const inviteToGame = async (userId: string, gameId: string, playerId: string) => {
    await db.collection('users').doc(userId).collection('games').doc(gameId).collection('invitations').doc(playerId).set({})

    const invitationId = uniqueId('invitation-')
    const invitation: Invitation = {
      hostId: userId,
      gameId,
      playerId
    }
    await db.collection('users').doc(playerId).collection('invitations').doc(invitationId).set(invitation)
  }

  const respondToGameInvitation = async (userId: string, hostId: string, gameId: string, status: InvitationStatus, notes: string) => {
    const response: InvitationResponse = {
      gameId,
      hostId,
      playerId: userId,
      status,
      notes,
      timestamp: Timestamp.now()
    }

    db.collection('users').doc(hostId).collection('games').doc(gameId).collection('responses').doc(userId).set(response)
  }
  
  const listenToGames =  (userId: string, onGames: GamesEvent) => {
    let ownGames: Game[] = []
    let invitationGames: Game[] = []

    const notify = () => {
      onGames(concat(ownGames, invitationGames))
    }

    db.collection('users').doc(userId).collection('games').get().then(docs => {
      ownGames = docs as Game[]
    })

    return db.collection('users').doc(userId).collection('invitations').onSnapshot(docs => {
      const games = map(doc => {
        const invitation = doc as Invitation
        return db.collection('users').doc(userId).collection('games').doc(invitation.gameId).get()
      }, docs)

      Promise.all(games).then(games => {
        invitationGames = map(game => game! as Game, games)
        notify()
      })
    })
  }

  const listenToGame = (userId: string, gameId: string, onGame: GameEvent) => {
    let game: Game | undefined = undefined
    let invitations: Invitation[] | undefined = undefined
    let responses: InvitationResponse[] | undefined = undefined

    const notify = () => {
      if (game && invitations && responses) {
        onGame(game, invitations, responses)
      }
    }

    const unsubscribeGame = db.collection('users').doc(userId).collection('games').doc(gameId).onSnapshot(docData => {
      game = docData as Game
      notify()
    })

    const unsubscribeInvitations = db
      .collection('users').doc(userId)
      .collection('games').doc(gameId)
      .collection('invitations').onSnapshot(docsData => {
        invitations = map(docData => docData as Invitation, docsData)
        notify()
      })

    const unsubscribeResponses = db
      .collection('users').doc(userId)
      .collection('games').doc(gameId)
      .collection('responses').onSnapshot(docsData => {
        responses = map(docData => docData as InvitationResponse, docsData)
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
    connectFriend,
    addFriend,
    removeFriend,
    createGame,
    inviteToGame,
    respondToGameInvitation,
    listenToGames,
    listenToGame
  }
}