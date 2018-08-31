import {Game, Invitation, InvitationResponse} from '../../db/types'
import {Dispatch, MiddlewareAPI} from 'redux'
import {State} from '../state'
import {Services} from '../../services/services'
import {getUserId} from '../auth/authReducer'
import {map, assign} from 'lodash/fp'
import {createEffectHandler} from '../../effect/effect'

export const INVITE = 'games/invite'
export const INVITATION_SENT = 'games/invitation-sent'
export const RESPOND_TO_INVITATION = 'games/respond-to-invitation'
export const CREATE_GAME = 'games/create-game'
export const LISTEN_TO_GAMES = 'games/listen'
export const UNLISTEN_TO_GAMES = 'games/unlisten'
export const SET_GAMES = 'games/set'

export const createGame = (game: Game) => ({type: CREATE_GAME as typeof CREATE_GAME, game})
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

export const createGameEffect = (createGame: CreateGame, store: MiddlewareAPI<Dispatch, State>, {db}: Services) => 
    db.collection('users').doc(createGame.game.hostId).collection('games').add(createGame.game)

export const inviteEffect = (invite: Invite, store: MiddlewareAPI<Dispatch, State>, {db}: Services) => {
  db.runTransaction(async tx => {
    const {gameId, hostId} = invite.invitation
    const hostInvitation = db.collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(invite.playerId)
    tx.set(hostInvitation, invite.invitation)

    const playerInvitation = db.collection('users').doc(invite.playerId).collection('invitations').doc(gameId)
    tx.set(playerInvitation, invite.invitation)
  })
}

export const respondToInvitationEffect = async (respondToInvitation: RespondToInvitation, store: MiddlewareAPI<Dispatch, State>, {db}: Services) => {
  const {hostId, gameId, playerId} = respondToInvitation.response
  await db.collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(playerId).set(respondToInvitation.response)
}

export const unlistenToGamesEffect = async (unlistenToGames: UnlistenToGames, store: MiddlewareAPI<Dispatch, State>, { callbacks }: Services) => {
  callbacks.callAndRemove('unsubscribe-games')
}

export const listenToGamesEffect = async (listenToGames: ListenToGames, store: MiddlewareAPI<Dispatch, State>, {db, callbacks}: Services) => {
  const userId = getUserId(store.getState())!
  const unsubscribe = db.collection('users').doc(userId).collection('games').onSnapshot(snapshot => {
    store.dispatch(setGames(map(doc => {
      return assign(doc.data(), {gameId: doc.id}) as Game
    }, snapshot.docs) ))
  })

  callbacks.add('unsubscribe-games', unsubscribe)
}

export const gamesEffects = createEffectHandler({
  [CREATE_GAME]: createGameEffect,
  [INVITE]: inviteEffect,
  [RESPOND_TO_INVITATION]: respondToInvitationEffect,
  [LISTEN_TO_GAMES]: listenToGamesEffect,
  [UNLISTEN_TO_GAMES]: unlistenToGamesEffect
})

export type GamesAction = Invite | RespondToInvitation | InvitationSent | CreateGame | ListenToGames |UnlistenToGames | SetGames