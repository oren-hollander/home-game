import { Game, Invitation, InvitationResponse } from '../../db/types'
import { HomeGameThunkAction } from '../state'
import { getUser } from '../auth/authReducer'
import { map, assign, omit } from 'lodash/fp'

export const INVITE = 'games/invite'
export const INVITATION_SENT = 'games/invitation-sent'
export const RESPOND_TO_INVITATION = 'games/respond-to-invitation'
export const CREATE_GAME = 'games/create-game'
export const LISTEN_TO_GAMES = 'games/listen'
export const UNLISTEN_TO_GAMES = 'games/unlisten'
export const SET_GAMES = 'games/set'

export const createGame = (game: Game) => ({ type: CREATE_GAME as typeof CREATE_GAME, game})
export type CreateGame = ReturnType<typeof createGame>

export const invite = (invitation: Invitation, playerId: string) => ({type: INVITE as typeof INVITE, invitation, playerId})
export type Invite = ReturnType<typeof invite>

export const respondToInvitation = (response: InvitationResponse) => ({type: RESPOND_TO_INVITATION as typeof RESPOND_TO_INVITATION, response})
export type RespondToInvitation = ReturnType<typeof respondToInvitation>

const invitationSent = () => ({type: INVITATION_SENT as typeof INVITATION_SENT})
export type InvitationSent = ReturnType<typeof invitationSent>

export const listenToGames = () => ({ type: LISTEN_TO_GAMES as typeof LISTEN_TO_GAMES })
export type ListenToGames = ReturnType<typeof listenToGames>

export const unlistenToGames = () => ({ type: UNLISTEN_TO_GAMES as typeof UNLISTEN_TO_GAMES })
export type UnlistenToGames = ReturnType<typeof unlistenToGames>

const setGames = (games: Game[]) => ({type: SET_GAMES as typeof SET_GAMES, games})
export type SetGames = ReturnType<typeof setGames>

export const createGameEffect = (game: Game): HomeGameThunkAction => (dispatch, getState, { db }) => 
    db.collection('users').doc(game.hostId).collection('games').add(game)

export const inviteEffect = (invitation: Invitation, playerId: string): HomeGameThunkAction => (dispatch, getState, { db }) => {
  db.runTransaction(async tx => {
    const {gameId, hostId} = invitation
    const hostInvitation = db.collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(playerId)
    tx.set(hostInvitation, invitation)

    const playerInvitation = db.collection('users').doc(playerId).collection('invitations').doc(gameId)
    tx.set(playerInvitation, invitation)
  })
}

export const respondToInvitationEffect = (response: InvitationResponse): HomeGameThunkAction => async (dispatch, getState, { db }) => {
  const { hostId, gameId, playerId } = response
  await db.collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(playerId).set(omit(['hostId', 'gameId', 'playerId'], response))
}

export const unlistenToGamesEffect = (): HomeGameThunkAction => async (dispatch, getState, { callbacks }) => {
  callbacks.callAndRemove('unsubscribe-games')
}

export const listenToGamesEffect = (): HomeGameThunkAction => async (dispatch, getState, { db, callbacks }) => {
  const userId = getUser(getState()).name
  const unsubscribe = db.collection('users').doc(userId).collection('games').onSnapshot(snapshot => {
    dispatch(setGames(map(doc => {
      return assign(doc.data(), {gameId: doc.id}) as Game
    }, snapshot.docs) ))
  })

  callbacks.add('unsubscribe-games', unsubscribe)
}

export type GamesAction = Invite | RespondToInvitation | InvitationSent | CreateGame | ListenToGames | UnlistenToGames | SetGames