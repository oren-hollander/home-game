// import 'firebase/firestore'
// import {Effect} from 'redux-saga'
// import * as firebase from 'firebase/app'
import {Game, Invitation, InvitationResponse} from '../../model/types'
import {Dispatch} from 'redux'
import {GetState} from '../index'
import {Services} from '../../app/services'
import {getUserId} from '../auth/authReducer'
import {map} from 'lodash/fp'

export const INVITE = 'games/invite'
export const INVITATION_SENT = 'games/invitation-sent'
export const RESPOND_TO_INVITATION = 'games/respond-to-invitation'
export const CREATE_GAME = 'games/create-game'
export const LOAD_GAMES = 'games/load'
export const SET_GAMES = 'games/set'

export const createGame = (game: Game) => ({type: CREATE_GAME as typeof CREATE_GAME, payload: game})
export type CreateGame = ReturnType<typeof createGame>

export const invite = (invitation: Invitation) => ({type: INVITE as typeof INVITE, payload: invitation})
export type Invite = ReturnType<typeof invite>

export const respondToInvitation = (response: InvitationResponse) => ({type: RESPOND_TO_INVITATION as typeof RESPOND_TO_INVITATION, payload: response})
export type RespondToInvitation = ReturnType<typeof respondToInvitation>

const invitationSent = () => ({type: INVITATION_SENT as typeof INVITATION_SENT})
export type InvitationSent = ReturnType<typeof invitationSent>

export const loadGames = () => ({type: LOAD_GAMES as typeof LOAD_GAMES})
export type LoadGames = ReturnType<typeof loadGames>

const setGames = (games: Game[]) => ({type: SET_GAMES as typeof SET_GAMES, games})
export type SetGames = ReturnType<typeof setGames>

export const createGameEffect = async (createGame: CreateGame, dispatch: Dispatch, getState: GetState, {db}: Services) => {
  console.log('create game effect', createGame.payload)
  try {
    const ref = await db.collection('users').doc(createGame.payload.hostId).collection('games').add(createGame.payload)
    console.log('ref id', ref.id)
  }
  catch (e) {
    console.log('error', e)
  }
}

export const inviteEffect = (invite: Invite, dispatch: Dispatch, getState: GetState, {db}: Services) => {
  db.runTransaction(async tx => {
    const {gameId, hostId, playerId} = invite.payload
    const hostInvitation = db.collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(playerId)
    tx.set(hostInvitation, invite.payload)

    const playerInvitation = db.collection('users').doc(playerId).collection('invitations').doc(gameId)
    tx.set(playerInvitation, invite.payload)
  })
}

export const respondToInvitationEffect = async (respondToInvitation: RespondToInvitation, dispatch: Dispatch, getState: GetState, {db}: Services) => {
  const {hostId, gameId, playerId} = respondToInvitation.payload
  await db.collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(playerId).set(respondToInvitation.payload)
}

export const loadGamesEffect = async (loadGames: LoadGames, dispatch: Dispatch, getState: GetState, {db}: Services) => {
  const userId = getUserId(getState())
  const querySnapshot = await db.collection('users').doc(userId!).collection('games').get()
  const games: Game[] = map(doc => {
    const game = doc.data()
    return {
      gameId: game.gameId,
      hostId: game.hostId,
      type: game.type,
      stakes: game.stakes,
      maxPlayers: game.maxPlayers,
      date: game.date,
      time: game.time,
      address: game.address,
      notes: game.notes
    }
  }, querySnapshot.docs)
  dispatch(setGames(games))
}

export const gamesEffects = {
  [CREATE_GAME]: createGameEffect,
  [INVITE]: inviteEffect,
  [RESPOND_TO_INVITATION]: respondToInvitationEffect,
  [LOAD_GAMES]: loadGamesEffect
}

export type GamesAction = Invite | RespondToInvitation | InvitationSent | CreateGame | LoadGames | SetGames
