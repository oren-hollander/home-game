import 'firebase/firestore'
import {Effect} from 'redux-saga'
import {all, call, takeEvery} from 'redux-saga/effects'
import * as firebase from 'firebase/app'
import {Game, Invitation, InvitationResponse} from '../../model/types'

const db = firebase.firestore()

export const INVITE = 'games/invite'
export const INVITATION_SENT = 'games/invitation-sent'
export const RESPOND_TO_INVITATION = 'games/respond-to-invitation'
export const CREATE_GAME = 'games/create-game'

const createGame = (game: Game) => ({type: CREATE_GAME as typeof CREATE_GAME, payload: game})
export type CreateGame = ReturnType<typeof createGame>

const invite = (invitation: Invitation) => ({type: INVITE as typeof INVITE, payload: invitation})
export type Invite = ReturnType<typeof invite>

const respondToInvitation = (response: InvitationResponse) => ({type: RESPOND_TO_INVITATION as typeof RESPOND_TO_INVITATION, payload: response})
export type RespondToInvitation = ReturnType<typeof respondToInvitation>

const invitationSent = () => ({type: INVITATION_SENT as typeof INVITATION_SENT})
export type InvitationSent = ReturnType<typeof invitationSent>

function* createGameSaga(createGame: CreateGame): Iterator<Effect> {
  yield call(db.collection('users').doc(createGame.payload.hostId).collection('games').doc().set, createGame.payload)
}

function* inviteSaga(invite: Invite): Iterator<Effect> {
  yield call(() => {
    db.runTransaction(async tx => {
      const {gameId, hostId, playerId} = invite.payload
      const hostInvitation = db.collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(playerId)
      tx.set(hostInvitation, invite.payload)

      const playerInvitation = db.collection('users').doc(playerId).collection('invitations').doc(gameId)
      tx.set(playerInvitation, invite.payload)
    })
  })
}

function* respondToInvitationSaga(respondToInvitation: RespondToInvitation): Iterator<Effect> {
  const {hostId, gameId, playerId} = respondToInvitation.payload
  yield call(db.collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(playerId).set, respondToInvitation.payload)
}

export function* gamesSaga(): Iterator<Effect> {
  yield all([
    takeEvery(CREATE_GAME, createGameSaga),
    takeEvery(INVITE, inviteSaga),
    takeEvery(RESPOND_TO_INVITATION, respondToInvitationSaga)
  ])
}

export type GamesAction = Invite | InvitationResponse | InvitationSent | CreateGame
