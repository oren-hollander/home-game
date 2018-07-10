// import 'firebase/firestore'
// import {Effect} from 'redux-saga'
import * as firebase from 'firebase/app'
import {Game, Invitation, InvitationResponse} from '../../model/types'
import {Dispatch} from 'redux'
export const INVITE = 'games/invite'
export const INVITATION_SENT = 'games/invitation-sent'
export const RESPOND_TO_INVITATION = 'games/respond-to-invitation'
export const CREATE_GAME = 'games/create-game'

export const createGame = (game: Game) => ({type: CREATE_GAME as typeof CREATE_GAME, payload: game})
export type CreateGame = ReturnType<typeof createGame>

export const invite = (invitation: Invitation) => ({type: INVITE as typeof INVITE, payload: invitation})
export type Invite = ReturnType<typeof invite>

export const respondToInvitation = (response: InvitationResponse) => ({type: RESPOND_TO_INVITATION as typeof RESPOND_TO_INVITATION, payload: response})
export type RespondToInvitation = ReturnType<typeof respondToInvitation>

const invitationSent = () => ({type: INVITATION_SENT as typeof INVITATION_SENT})
export type InvitationSent = ReturnType<typeof invitationSent>

type GetState = () => any

export const createGameEffect = async (createGame: CreateGame, dispatch: Dispatch, getState: () => any, {db}: {db: firebase.firestore.Firestore}) => {
  console.log('create game effect', createGame.payload)
  try {
    const ref = await db.collection('users').doc(createGame.payload.hostId).collection('games').add(createGame.payload)
    console.log('ref id', ref.id)
  }
  catch (e) {
    console.log('error', e)
  }
}

export const inviteEffect = (invite: Invite, dispatch: Dispatch, getState: GetState, {db}: {db: firebase.firestore.Firestore}) => {
  db.runTransaction(async tx => {
    const {gameId, hostId, playerId} = invite.payload
    const hostInvitation = db.collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(playerId)
    tx.set(hostInvitation, invite.payload)

    const playerInvitation = db.collection('users').doc(playerId).collection('invitations').doc(gameId)
    tx.set(playerInvitation, invite.payload)
  })
}

export const respondToInvitationEffect = async (respondToInvitation: RespondToInvitation, dispatch: Dispatch, getState: () => any, {db}: {db: firebase.firestore.Firestore}) => {
  const {hostId, gameId, playerId} = respondToInvitation.payload
  await db.collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(playerId).set(respondToInvitation.payload)
}

export const gamesEffects = {
  [CREATE_GAME]: createGameEffect,
  [INVITE]: inviteEffect,
  [RESPOND_TO_INVITATION]: respondToInvitationEffect
}

export type GamesAction = Invite | InvitationResponse | InvitationSent | CreateGame
