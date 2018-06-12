import { Game, InvitationStaus, Invitation } from './types'
import * as firebase from 'firebase'
import { Collection, Id } from './firebaseUtils'

enum Collections { 
 GAMES = 'games',
 INVITATIONS = 'invitations'
}

export interface Api {
  createGame(game: Game): Promise<string> 
  getGame(gameId: string): Promise<Game & Id | void>
  invite(playerId: string, gameId: string): Promise<void>
  updateInvitationStatus(playerId: string, gameId: string, status: InvitationStaus): Promise<void>,
  getInvitation(playerId: string, gameId: string): Promise<Invitation | void>,
  getGameInvitation(gameId: string): Promise<Invitation[]> 
}

export const Api = (firestore: firebase.firestore.Firestore): Api => {

  const gamesCollectionRef = firestore.collection(Collections.GAMES)
  const games = Collection<Game>(gamesCollectionRef)

  const createGame = async (game: Game) => games.add(game)

  const getGame = async (gameId: string) => games.get(gameId)

  const invite = async (playerId: string, gameId: string): Promise<void> => {
    return firestore.runTransaction(async tx => {
      const invitations = games.subCollection(gameId, Collections.INVITATIONS).transactive(tx)

      const invitation = await invitations.get(playerId)
      if(!invitation){
        return invitations.set(Invitation(playerId, InvitationStaus.NoResponse, ''))
      }
    })
  }

  const updateInvitationStatus = async (playerId: string, gameId: string, status: InvitationStaus): Promise<void> => {
    const invitations = Collection<Invitation>(gamesCollectionRef.doc(gameId).collection(Collections.INVITATIONS))
    return invitations.update(playerId, { status })
  }

  const getInvitation = async (playerId: string, gameId: string): Promise<Invitation | void> => {
    const invitations = Collection<Invitation>(gamesCollectionRef.doc(gameId).collection(Collections.INVITATIONS))
    return invitations.get(playerId)
  }

  const getGameInvitation = async (gameId: string): Promise<Invitation[]> => {
    const invitations = Collection<Invitation>(gamesCollectionRef.doc(gameId).collection(Collections.INVITATIONS))
    return invitations.query()
  }

  // const inviteToHomeGame = async (userId: string, email)

  return {
    createGame,
    getGame,
    invite,
    updateInvitationStatus,
    getInvitation,
    getGameInvitation
  }
}