import { Api } from './api'
import * as firebase from 'firebase'
import { Game, GameType, Stakes, InvitationStaus, Invitation } from './types'

describe('api', () => {  
  let firestore: firebase.firestore.Firestore
  let api: Api 

  beforeAll(() => {
    var config = {
      apiKey: "AIzaSyCL0jL94GPb7HvZxUgZdnpqqyx5liMeY3A",
      authDomain: "fire-base-test-4304c.firebaseapp.com",
      databaseURL: "https://fire-base-test-4304c.firebaseio.com",
      projectId: "fire-base-test-4304c",
      storageBucket: "fire-base-test-4304c.appspot.com",
      messagingSenderId: "223479729697"
    }

    firebase.initializeApp(config)
    firestore = firebase.firestore()

    const settings = {
      timestampsInSnapshots: true
    }

    firestore.settings(settings)

    api = Api(firestore)
  })

  test('creste user', async done => {

    firebase.auth().onAuthStateChanged(async user => {
      console.log(user ? user.uid : 'hhh')
      if (user) {
        // await user.sendEmailVerification()
        // await user.updateProfile({ displayName: 'Oren Hollander', photoURL: 'http://' })

        console.log('updated')
        console.log(user ? 'in' : 'out')
        done()
      }
    })

    await firebase.auth().signInWithEmailAndPassword('oren.hollander@gmail.com', '1234567')
  })

  test.skip('ref', async () => {
    console.log('ref')
    const ref = firestore.collection('test-ref').doc('test-doc')
    await ref.set({ref})
    const data = await firestore.collection('test-ref').get()
    const ref2 = <firebase.firestore.DocumentReference>data.docs[0].data().ref
    // console.log(ref2)
    // const ref3 = ref2.get('ref')
    const data2 = await ref2.get()
    console.log(data2.data())
  })

  test.skip('createGame', async () => {
    const game = Game('host', GameType.PLO, Stakes(5, 5), 8)
    const gameId = await api.createGame(game)
    const createdGame = await firestore.collection('games').doc(gameId).get()
    expect(createdGame.exists).toBe(true)
    expect(createdGame.data()).toEqual(game)
  })

  test.skip('invite player to game', async () => {
    const game = Game('host', GameType.PLO, Stakes(5, 5), 8)
    const gameId = await api.createGame(game)
    await api.invite('player-1', gameId)
    const invitationSnapshot = await firestore.collection('games').doc(gameId).collection('invitations').doc('player-1').get()
    expect(invitationSnapshot.exists).toBe(true)
    const invitation = invitationSnapshot.data()
    expect(invitation && invitation.status).toEqual(InvitationStaus.NoResponse)
  })

  test.skip('player responds to invitation', async () => {
    const game = Game('host', GameType.PLO, Stakes(5, 5), 8)
    const gameId = await api.createGame(game)
    await api.invite('player-1', gameId)
    await api.updateInvitationStatus('player-1', gameId, InvitationStaus.Approved)
    const invitationSnapshot = await firestore.collection('games').doc(gameId).collection('invitations').doc('player-1').get()
    expect(invitationSnapshot.exists).toBe(true)
    const invitation = invitationSnapshot.data()
    expect(invitation && invitation.status).toEqual(InvitationStaus.Approved)
  })
  
  test.skip('get all gamee invitations', async () => {
    const game = Game('host', GameType.PLO, Stakes(5, 5), 8)
    const gameId = await api.createGame(game)
    await api.invite('player-1', gameId)
    await api.invite('player-2', gameId)
    await api.updateInvitationStatus('player-1', gameId, InvitationStaus.Approved)
    await api.updateInvitationStatus('player-2', gameId, InvitationStaus.Declined)
    const invitations = await api.getGameInvitation(gameId)

    expect(invitations).toEqual([
      Invitation('player-1', InvitationStaus.Approved), 
      Invitation('player-2', InvitationStaus.Declined)
    ])
  })
})