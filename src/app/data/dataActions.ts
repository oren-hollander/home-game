import { HomeGameAsyncThunkAction } from '../state'
import { getSignedInUser } from '../auth/authReducer'
import { map, compact, concat, fromPairs } from 'lodash/fp'
import { setUsers, setUser } from '../users/usersActions'
import { setAddresses } from '../addresses/addressesActions'
import { setGames } from '../games/gamesActions'
import { GameAndInvitation } from '../games/gamesReducer'
import { setFriends } from '../friends/friendsActions';

export const loadFriends = (): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const user = getSignedInUser(getState())
  const friendIds = await db.getFriendIds(user.userId)
  dispatch(setFriends(friendIds))

  const friends = compact(await Promise.all(map(db.getUser, friendIds)))
  dispatch(setUsers(friends))
}

export const loadAddresses = (): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const user = getSignedInUser(getState())
  const addresses = await db.getAddresses(user.userId)
  dispatch(setAddresses(addresses))
}

export const loadGames = (): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  const user = getSignedInUser(getState())
  const ownGames = await db.getOwnGames(user.userId)
  const invitations = await db.getIncomingInvitations(user.userId)
  const invitationGames = compact(
    await Promise.all(map(invitation => db.getGame(invitation.hostId, invitation.gameId), invitations))
  )

  const games = concat(ownGames, invitationGames)
  const gamesAndInvitations = fromPairs(
    await Promise.all(
      map(async game => {
        const invitedPlayerIds = await db.getGameInvitedPlayerIds(user.userId, game.gameId)
        const invitedPlayers = compact(await Promise.all(map(playerId => db.getUser(playerId), invitedPlayerIds)))
        const invitationResponses = await db.getGameInvitationResponse(user.userId, game.gameId)
        return [
          game.gameId,
          {
            game,
            invitedPlayers,
            invitationResponses
          }
        ] as [string, GameAndInvitation]
      }, games)
    )
  )
  
  dispatch(setGames(gamesAndInvitations))
}

export const loadData = (): HomeGameAsyncThunkAction => async (dispatch, getState, { db }) => {
  dispatch(setUser(getSignedInUser(getState())))
  dispatch(loadFriends())
  dispatch(loadAddresses())
  dispatch(loadGames())
}
