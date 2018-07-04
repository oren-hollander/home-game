import {Effect} from 'redux-saga'
import {all, call, put, takeEvery} from 'redux-saga/effects'
import * as firebase from 'firebase/app'
import 'firebase/firestore'
import {InvitationResponse} from '../../model/game'

const db = firebase.firestore()

export const INVITE = 'games/invite'
export const INVITATION_SENT = 'games/invitation-sent'
export const RESPOND_TO_INVITATION = 'games/respond-to-invitation'

const invite = (hostId: string, gameId: string, playerId: string) => ({type: INVITE as typeof INVITE, hostId, gameId, playerId})
export type Invite = ReturnType<typeof invite>

const respondToInvitation = (response: InvitationResponse) => ({type: RESPOND_TO_INVITATION as typeof RESPOND_TO_INVITATION, payload: response})
export type ResponsdToInvitation = ReturnType<typeof respondToInvitation>

const invitationSent = () => ({type: INVITATION_SENT})
export type InvitationSent = ReturnType<typeof invitationSent>

function* inviteSaga({playerId, gameId, hostId}: Invite): Iterator<Effect> {
  yield call(() => {
    db.runTransaction(async tx => {
      const invitation = {gameId, hostId, playerId}
      const hostInvitation = db.collection('users').doc(hostId).collection('games').doc(gameId).collection('invitations').doc(playerId)
      tx.set(hostInvitation, invitation)

      const playerInvitation = db.collection('users').doc(playerId).collection('invitations').doc(gameId)
      tx.set(playerInvitation, invitation)
    })
  })
  yield put(invitationSent())
}

function* respondToInvitationSaga({payload: {hostId, playerId, gameId}} : ResponsdToInvitation): Iterator<Effect> {
  yield call(() => {
    db.collection('users').doc(hostId).collection('invitations').doc(playerId)
  })
}

export function* gamesSaga(): Iterator<Effect> {
  yield all([
    takeEvery(INVITE, inviteSaga),
    takeEvery(RESPOND_TO_INVITATION, respondToInvitationSaga),
  ])
}

export type GamesAction = Invite | InvitationResponse | InvitationSent
