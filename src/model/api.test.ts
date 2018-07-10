// import { Database } from './api'
// import * as firebase from 'firebase'
// import { Game, GameType, Stakes, InvitationStatus, GameInvitation } from './types'
// import {Action} from "redux";
//
// // const {Approved, Declined, NoResponse} = InvitationStatus
//
// describe('db', () => {
//   let firestore: firebase.firestore.Firestore
//   let functions: firebase.functions.Functions
//
//   let db: Database
//
//   // beforeAll(() => {
//   //   const config = {
//   //     apiKey: "AIzaSyCL0jL94GPb7HvZxUgZdnpqqyx5liMeY3A",
//   //     authDomain: "fire-base-test-4304c.firebaseapp.com",
//   //     databaseURL: "https://fire-base-test-4304c.firebaseio.com",
//   //     projectId: "fire-base-test-4304c",
//   //     storageBucket: "fire-base-test-4304c.appspot.com",
//   //     messagingSenderId: "223479729697"
//   //   }
//   //
//   //   firebase.initializeApp(config)
//   //   functions = firebase.functions()
//   //   firestore = firebase.firestore()
//   //
//   //   const settings = {
//   //     timestampsInSnapshots: true
//   //   }
//   //
//   //   firestore.settings(settings)
//   //
//   //   db = Database(firestore)
//   // })
//
//
//   test('', () => {
//     // interface IMyAction extends Action<'my-type'>{
//     //   readonly x: number
//     // }
//     //
//     // class MyAction implements MyAction {
//     //   constructor(public readonly x: number){}
//     // }
//
//
//     class MyAction implements Action<'my-action'> {
//       type: 'my-action' = 'my-action'
//       constructor(public i: number){
//         this.i = i
//       }
//     }
//
//     const reducer = <T extends Action<string>>(s: object, a: T): object => {
//       if(a instanceof MyAction){
//         return {...s, i: a.i}
//       }
//       return {}
//     }
//
//     console.log(reducer({i: 3}, new MyAction(32)))
//
//   })
//
//   // https://homegm.app/auth?mode=verifyEmail&oobCode=DhZ8L_qhsMV0PW2J4cyECk_ddQW7TE0OXUEY0Rwi8wsAAAFj_ZeT-w&apiKey=AIzaSyCL0jL94GPb7HvZxUgZdnpqqyx5liMeY3A&lang=en
//   // localhost:3000/auth?mode=verifyEmail&oobCode=DhZ8L_qhsMV0PW2J4cyECk_ddQW7TE0OXUEY0Rwi8wsAAAFj_ZeT-w&apiKey=AIzaSyCL0jL94GPb7HvZxUgZdnpqqyx5liMeY3A&lang=en
//   test.skip('is validated', async () => {
//     // firebase.auth().
//     const x: firebase.auth.UserCredential = await firebase.auth().signInWithEmailAndPassword('oren.hollander@gmail.com', '123456')
//     const user = x.user!
//
//     if(user.emailVerified) {
//       console.log('user verified')
//     }
//     else {
//       try {
//         await firebase.auth().applyActionCode('DhZ8L_qhsMV0PW2J4cyECk_ddQW7TE0OXUEY0Rwi8wsAAAFj_ZeT-w')
//         console.log('email verified')
//       }
//       catch (e) {
//         console.log('error', e)
//       }
//     //   console.log('sending verification email')
//     //   await user.sendEmailVerification()
//     }
//   })
//
//   test.skip('send invitation', async () => {
//     console.log(await functions.httpsCallable('sendInvitation')())
//   })
//
//   test.skip('creste user', async done => {
//     firebase.auth().onAuthStateChanged(async user => {
//       console.log(user ? user.uid : 'hhh')
//       if (user) {
//         // await user.sendEmailVerification()
//         // await user.updateProfile({ displayName: 'Oren Hollander', photoURL: 'http://' })
//
//         console.log('updated')
//         console.log(user ? 'in' : 'out')
//         done()
//       }
//     })
//
//     await firebase.auth().signInWithEmailAndPassword('oren.hollander@gmail.com', '1234567')
//   })
//
//   test.skip('ref', async () => {
//     console.log('ref')
//     const ref = firestore.collection('test-ref').doc('test-doc')
//     await ref.set({ref})
//     const data = await firestore.collection('test-ref').get()
//     const ref2 = <firebase.firestore.DocumentReference>data.docs[0].data().ref
//     // console.log(ref2)
//     // const ref3 = ref2.get('ref')
//     const data2 = await ref2.get()
//     console.log(data2.data())
//   })
//
//   test.skip('createGame', async () => {
//     const game = Game('host', GameType.PLO, Stakes(5, 5), 8)
//     const gameId = await db.createGame(game)
//     const createdGame = await firestore.collection('games').doc(gameId).get()
//     expect(createdGame.exists).toBe(true)
//     expect(createdGame.data()).toEqual(game)
//   })
//
//   test.skip('invite player to game', async () => {
//     const game = Game('host', 'PLO', {smallBlind: 5, bigBlind: 5}, 8)
//     const gameId = await db.createGame(game)
//     await db.invite('player-1', gameId)
//     const invitationSnapshot = await firestore.collection('games').doc(gameId).collection('invitations').doc('player-1').get()
//     expect(invitationSnapshot.exists).toBe(true)
//     const invitation = invitationSnapshot.data()
//     expect(invitation && invitation.status).toEqual(NoResponse)
//   })
//
//   test.skip('player responds to invitation', async () => {
//     const game = {
//       hostId: 'host',
//       gameId: '',
//       type: 'PLO',
//       stakes: {smallBlind: 5, bigBlind: 5},
//       maxPlayers: 8,
//       date: {year: 2018, month: 7, day: 4},
//       time: {hour: 20, minute: 45},
//       address: {
//         houseNumber: 6,
//         street: 'main',
//         city: 'NY'
//       }
//     }
//
//     const gameId = await db.createGame(game)
//     await db.invite('player-1', gameId)
//     await db.updateInvitationStatus('player-1', gameId, 'approved')
//     const invitationSnapshot = await firestore.collection('games').doc(gameId).collection('invitations').doc('player-1').get()
//     expect(invitationSnapshot.exists).toBe(true)
//     const invitation = invitationSnapshot.data()
//     expect(invitation && invitation.status).toEqual(Approved)
//   })
//
//   test.skip('get all gamee invitations', async () => {
//     const game = Game('host', GameType.PLO, Stakes(5, 5), 8)
//     const gameId = await db.createGame(game)
//     await db.invite('player-1', gameId)
//     await db.invite('player-2', gameId)
//     await db.updateInvitationStatus('player-1', gameId, Approved)
//     await db.updateInvitationStatus('player-2', gameId, Declined)
//     const invitations = await db.getGameInvitation(gameId)
//
//     expect(invitations).toEqual([
//       GameInvitation('player-1', Approved),
//       GameInvitation('player-2', Declined)
//     ])
//   })
// })

describe('test', () => {
  test('test', () => {
    expect(true).toBe(true)
  })
})
