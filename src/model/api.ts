import {Game, GameInvitationStatus, GameInvitation, HomeGameInvitation, User} from './types'
import * as firebase from 'firebase/app'
import { Collection } from './firebaseUtils'

enum Collections { 
  GAMES = 'games',
  INVITATIONS = 'invitations',
  USERS = 'users'
}

const {GAMES, INVITATIONS, USERS} = Collections

const {NoResponse} = GameInvitationStatus

export interface Database {
  // createUser(user: User): Promise<void>
  // findUser(name: string): Promise<User | undefined>

  createGame(game: Game): Promise<string> 
  getGame(gameId: string): Promise<Game | undefined>
  invite(playerId: string, gameId: string): Promise<void>
  updateInvitationStatus(playerId: string, gameId: string, status: GameInvitationStatus): Promise<void>
  getInvitation(playerId: string, gameId: string): Promise<GameInvitation | undefined>
  getGameInvitation(gameId: string): Promise<GameInvitation[]>
  inviteToHomeGame(userId: string, email: string): Promise<void>
}
export const Auth = (auth: firebase.auth.Auth, firestore: firebase.firestore.Firestore) => {
  // const signUp = async (email: string, password: string): Promise<firebase.User> => {
  //   state.auth.createUserWithEmailAndPassword(email, password)
  //
  // }

  const Users = Collection<User>(firestore.collection(USERS), 'uid')

  const signIn = async (email: string, password: string): Promise<User | undefined> => {
    let resolveSignIn: (user: firebase.User) => void

    const promise = new Promise<firebase.User>(resolve => {
      resolveSignIn = resolve
    })

    const unsubscribe = auth.onAuthStateChanged(user => {
      if(user){
        unsubscribe()

        resolveSignIn(user)
      }
    })

    auth.signInWithEmailAndPassword(email, password)

    const fireBaseUser = await promise
    return Users.get(fireBaseUser.uid)
  }

  return {
    signIn
  }
}

export const Database = (firestore: firebase.firestore.Firestore): Database => {
  const Games = Collection<Game>(firestore.collection(GAMES))

  const createGame = async (game: Game) => Games.add(game)

  const getGame = async (gameId: string) => Games.get(gameId)

  // const createUser = async (user: User): Promise<void> => {
  //
  // }

  const invite = async (playerId: string, gameId: string): Promise<void> => {
    return firestore.runTransaction(async tx => {
      const invitations = Games.subCollection(gameId, INVITATIONS).transactive(tx)

      const invitation = await invitations.get(playerId)
      if(!invitation){
        return invitations.set(GameInvitation(playerId, NoResponse, ''))
      }
    })
  }

  const updateInvitationStatus = async (playerId: string, gameId: string, status: GameInvitationStatus): Promise<void> => {
    const Invitations = Games.subCollection<GameInvitation>(gameId, INVITATIONS)
    return Invitations.update(playerId, { status })
  }

  const getInvitation = async (playerId: string, gameId: string): Promise<GameInvitation | undefined> => {
    const Invitations = Games.subCollection<GameInvitation>(gameId, INVITATIONS)
    return Invitations.get(playerId)
  }

  const getGameInvitation = async (gameId: string): Promise<GameInvitation[]> => {
    const Invitations = Games.subCollection<GameInvitation>(gameId, INVITATIONS)
    return Invitations.query()
  }

  const inviteToHomeGame = async (userId: string, email: string): Promise<void> => {
    const invitations = Collection<HomeGameInvitation>(firestore.collection(INVITATIONS))
    return invitations.set(HomeGameInvitation(userId, email))
  }


  return {
    createGame,
    getGame,
    invite,
    updateInvitationStatus,
    getInvitation,
    getGameInvitation,
    inviteToHomeGame
  }
}