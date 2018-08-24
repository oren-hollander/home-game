import { Schema, deleteDocuments, getDocumentRefs } from './deleteDatabase'
import { Firestore } from '../app/firestore'
import * as firebase from 'firebase/app'
import 'firebase/auth'

describe('delete database', () => {
  test('should delete all documents', async () => {
    const firestore = Firestore()

    const schema: Schema = {
      users: {
        friends: {},
        friendInvitations: {},
        addresses: {},
        games: {
          invitations: {},
          responses: {}
        },
        invitations: {}
      }
    }

    await firebase.auth().signInWithEmailAndPassword('oren.hollander@gmail.com', '123456')

    const refs = await getDocumentRefs(firestore.collection.bind(firestore), schema)
    await deleteDocuments(firestore, refs)
  })
}) 