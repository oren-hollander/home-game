import * as firebase from 'firebase/app'
import { Game, InvitationStatus, Time } from '../model/types'
import { flow, map, noop, concat, filter, join } from 'lodash/fp'

type Firestore = firebase.firestore.Firestore
type DocumentChange = firebase.firestore.DocumentChange

export interface GamesEvent {
  (games: ReadonlyArray<Game>): void
}

export interface GamesDB {
  addGame(game: Game): Promise<string>
  inviteToGame(gameId: string, playerId: string): Promise<void>
  respondToGameInvitation(hostId: string, gameId: string, status: InvitationStatus, arriveTime: Time): Promise<void>
  listenToGames(onGames: GamesEvent): void 
  unlistenToGames(): void
}

const path = (...names: string[]) => join('/', names)

const USERS = 'users'
const GAMES = 'games'
const INVITATIONS = 'invitations'
const INVITATION_RESPONSES = 'invitation-responses'

export const GamesDB: (db: Firestore, userId: string) => GamesDB = (db, userId) => {
  let unsubscribe: () => void = noop

  const collection = (...names: string[]) => db.collection(path(...names))

  const Games = collection(USERS, userId, GAMES)
  const PlayerGames = (playerId: string) => collection(USERS, playerId, GAMES)

  const OutgoingInvitations = (gameId: string) => collection(USERS, userId, GAMES, gameId, INVITATIONS)
  const IncomingInvitations = (playerId: string) => collection(USERS, playerId, INVITATIONS)
  const InvitationResponses = (hostId: string, gameId: string) => collection(USERS, hostId, GAMES, gameId, INVITATION_RESPONSES)

  const addGame: (game: Game) => Promise<string> = async game => {
    const ref = await Games.add(game)
    return ref.id
  }

  const inviteToGame: (gameId: string, playerId: string) => Promise<void> = async (gameId, playerId) => {
    db.runTransaction(async tx => {
      tx.set(OutgoingInvitations(gameId).doc(playerId), {})
      tx.set(IncomingInvitations(playerId).doc(gameId), {hostId: userId})
    })
  }

  const respondToGameInvitation = async (hostId: string, gameId: string, status: InvitationStatus, arriveTime: Time) => 
    InvitationResponses(hostId, gameId).doc(userId).set({
      status,
      arriveTime      
    })

  const listenToGames: (onGames: GamesEvent) => void = onGames => {
    
    let ownGames: Game[] = []
    let invitationGames: Game[] = []

    const notify = () => {
      onGames(concat(ownGames, invitationGames))
    }

    Games.get()
      .then(snapshot => snapshot.docs)
      .then(map(doc => doc.data() as Game))
      .then(games => ownGames = games)
      .then(notify)

    unsubscribe = IncomingInvitations(userId).onSnapshot(snapshot => {
      const invitations = flow(
        filter((change: DocumentChange) => change.type === 'added' || change.type === 'modified'),
        map((change: DocumentChange) => ({
          hostId: change.doc.data().hostId,
          gameId: change.doc.id,
          playerId: userId 
        }))
      )(snapshot.docChanges())
    
      Promise.all(map(invitation => PlayerGames(invitation.hostId).doc(invitation.gameId).get(), invitations))
        .then(map(doc => doc.data() as Game))
        .then(games => invitationGames = games)
        .then(notify)
    })
  }
  
  const unlistenToGames: () => void = () => {
    unsubscribe()
  }

  return {
    addGame,
    inviteToGame,
    respondToGameInvitation,
    listenToGames,
    unlistenToGames
  }
}